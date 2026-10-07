import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  EntityName,
  FilterQuery,
  UniqueConstraintViolationException,
  wrap,
} from '@mikro-orm/postgresql';
import { PinoLogger } from 'nestjs-pino';
import { Business } from './entities/business.entity.js';
import { BusinessLocation } from './entities/business-location.entity.js';
import { BusinessMeta } from './entities/business-meta.entity.js';
import { BusinessLocationType } from './entities/business-location-type.entity.js';
import { IndustryType } from './entities/industry-type.entity.js';
import { AddressService } from '../address/address.service.js';
import { Subscription } from '../subscription/entities/subscription.entity.js';
import {
  BusinessDetailQueryDto,
  BusinessFilterQueryDto,
  BusinessLocationCreateRequestDto,
  BusinessLocationTypeCreateRequestDto,
  BusinessLocationTypeFilterQueryDto,
  BusinessLocationUpdateRequestDto,
  BusinessUpdateRequestDto,
  IndustryTypeCreateRequestDto,
  IndustryTypeFilterQueryDto,
} from './dtos/index.js';
import { randomInt } from 'node:crypto';

const DEFAULT_LOCATION_TYPE = 'Main';
const DISPLAY_ID_MAX_ATTEMPTS = 5;
const DEFAULT_PAGE_LIMIT = 20;

export interface AuthUserPayload {
  sub: string;
  userType: string;
  userRoleId: string;
  businessId: string | null;
}

export interface CreateBusinessInput {
  subscriptionId: string;
  industryTypeId: string;
  businessName: string;
  businessContactNo: string;
  businessEmail?: string | null;
}

@Injectable()
export class BusinessService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
    private readonly addressService: AddressService,
  ) {
    this.logger.setContext(BusinessService.name);
  }

  //internal
  async createBusiness(input: CreateBusinessInput): Promise<Business> {
    return this.em.transactional((em) => this.createBusinessWithEm(em, input));
  }

  //internal - callable within an existing transaction (e.g. user registration)
  async createBusinessWithEm(
    em: EntityManager,
    input: CreateBusinessInput,
  ): Promise<Business> {
    try {
      const newBusiness = em.create(Business, {
        subscriptionId: input.subscriptionId,
        industryTypeId: input.industryTypeId,
        businessName: input.businessName,
        businessContactNo: input.businessContactNo,
        businessEmail: input.businessEmail ?? null,
        displayId: await this.generateUniqueDisplayId(em, Business, 'BIZ'),
      });

      await em.flush();

      await this.createDefaultLocationWithEm(em, newBusiness);

      this.logger.info(`Business '${newBusiness.id}' created successfully`);

      return newBusiness;
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          'Could not create business due to a unique constraint conflict',
        );
      }
      throw e;
    }
  }

  //internal - every new business gets a default location
  private async createDefaultLocationWithEm(
    em: EntityManager,
    business: Business,
  ): Promise<BusinessLocation> {
    let locationType = await em.findOne(BusinessLocationType, {
      locationType: DEFAULT_LOCATION_TYPE,
    });

    if (!locationType) {
      locationType = em.create(BusinessLocationType, {
        locationType: DEFAULT_LOCATION_TYPE,
        isActive: true,
      });
      await em.flush();
    }

    const location = em.create(BusinessLocation, {
      businessId: business.id,
      locationTypeId: locationType.id,
      locationName: business.businessName,
      businessEmail: business.businessEmail ?? null,
      businessLocationContactNo: business.businessContactNo,
      isActive: true,
      displayId: await this.generateUniqueDisplayId(
        em,
        BusinessLocation,
        'LOC',
      ),
    });

    await em.flush();

    this.logger.info(
      `Default location '${location.id}' created for business '${business.id}'`,
    );

    return location;
  }

  //admin - add a location to any business
  async createBusinessLocation(
    businessId: string,
    dto: BusinessLocationCreateRequestDto,
  ) {
    return this.em.transactional(async (em) => {
      const business = await em.findOne(Business, {
        id: businessId,
        deletedAt: null,
      });

      if (!business) {
        throw new NotFoundException('Business not found');
      }

      return this.createBusinessLocationWithEm(em, business.id, dto);
    });
  }

  //customer - add a location to the caller's own business
  async createOwnBusinessLocation(
    user: AuthUserPayload,
    dto: BusinessLocationCreateRequestDto,
  ) {
    return this.em.transactional(async (em) => {
      const businessId = await this.resolveUserBusinessId(em, user);
      return this.createBusinessLocationWithEm(em, businessId, dto);
    });
  }

  private async createBusinessLocationWithEm(
    em: EntityManager,
    businessId: string,
    dto: BusinessLocationCreateRequestDto,
  ) {
    const locationType = await em.findOne(BusinessLocationType, {
      id: dto.locationTypeId,
    });

    if (!locationType) {
      throw new NotFoundException('Business location type not found');
    }

    try {
      const address = dto.address
        ? await this.addressService.createAddressWithEm(em, dto.address)
        : null;

      const location = em.create(BusinessLocation, {
        businessId,
        locationTypeId: locationType.id,
        addressId: address?.id ?? null,
        locationName: dto.locationName,
        businessEmail: dto.businessEmail ?? null,
        businessLocationContactNo: dto.businessLocationContactNo ?? null,
        isActive: dto.isActive ?? true,
        displayId: await this.generateUniqueDisplayId(
          em,
          BusinessLocation,
          'LOC',
        ),
      });

      await em.flush();

      this.logger.info(
        `Location '${location.id}' created for business '${businessId}'`,
      );

      return this.findLocationDetailOrFail(em, businessId, location.id);
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          'Could not create business location due to a unique constraint conflict',
        );
      }
      throw e;
    }
  }

  //admin - activate/deactivate any business
  async updateBusinessStatus(
    businessId: string,
    isActive: boolean,
  ): Promise<Business> {
    const business = await this.em.findOne(Business, {
      id: businessId,
      deletedAt: null,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.isActive = isActive;
    business.updatedAt = new Date();
    await this.em.flush();

    this.logger.info(
      `Business '${business.id}' ${isActive ? 'activated' : 'deactivated'}`,
    );

    return business;
  }

  //customer - update the caller's own business
  async updateOwnBusiness(
    user: AuthUserPayload,
    dto: BusinessUpdateRequestDto,
  ): Promise<Business> {
    return this.em.transactional(async (em) => {
      const businessId = await this.resolveUserBusinessId(em, user);
      return this.updateBusinessWithEm(em, businessId, dto);
    });
  }

  private async updateBusinessWithEm(
    em: EntityManager,
    businessId: string,
    dto: BusinessUpdateRequestDto,
  ): Promise<Business> {
    const business = await em.findOne(Business, {
      id: businessId,
      deletedAt: null,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (dto.industryTypeId) {
      const industryType = await em.findOne(IndustryType, {
        id: dto.industryTypeId,
      });

      if (!industryType) {
        throw new NotFoundException('Industry type not found');
      }
    }

    try {
      em.assign(business, { ...this.definedOnly(dto), updatedAt: new Date() });
      await em.flush();

      this.logger.info(`Business '${business.id}' updated successfully`);

      return business;
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          'Could not update business due to a unique constraint conflict',
        );
      }
      throw e;
    }
  }

  //admin - activate/deactivate a location of any business
  async updateBusinessLocationStatus(
    businessId: string,
    locationId: string,
    isActive: boolean,
  ): Promise<BusinessLocation> {
    const location = await this.em.findOne(BusinessLocation, {
      id: locationId,
      businessId,
      deletedAt: null,
    });

    if (!location) {
      throw new NotFoundException('Business location not found');
    }

    location.isActive = isActive;
    location.updatedAt = new Date();
    await this.em.flush();

    this.logger.info(
      `Location '${location.id}' ${isActive ? 'activated' : 'deactivated'}`,
    );

    return location;
  }

  //customer - update a location of the caller's own business
  async updateOwnBusinessLocation(
    user: AuthUserPayload,
    locationId: string,
    dto: BusinessLocationUpdateRequestDto,
  ) {
    return this.em.transactional(async (em) => {
      const businessId = await this.resolveUserBusinessId(em, user);
      return this.updateBusinessLocationWithEm(em, businessId, locationId, dto);
    });
  }

  private async updateBusinessLocationWithEm(
    em: EntityManager,
    businessId: string,
    locationId: string,
    dto: BusinessLocationUpdateRequestDto,
  ) {
    // Scoping by businessId stops one business from editing another's location
    const location = await em.findOne(BusinessLocation, {
      id: locationId,
      businessId,
      deletedAt: null,
    });

    if (!location) {
      throw new NotFoundException('Business location not found');
    }

    if (dto.locationTypeId) {
      const locationType = await em.findOne(BusinessLocationType, {
        id: dto.locationTypeId,
      });

      if (!locationType) {
        throw new NotFoundException('Business location type not found');
      }
    }

    try {
      const { address: addressDto, ...locationFields } = dto;

      if (addressDto && location.addressId) {
        await this.addressService.updateAddressWithEm(
          em,
          location.addressId,
          addressDto,
        );
      } else if (addressDto) {
        const { countryId, addressLine1, city } = addressDto;

        if (!countryId || !addressLine1 || !city) {
          throw new BadRequestException(
            'countryId, addressLine1 and city are required to add an address',
          );
        }

        const address = await this.addressService.createAddressWithEm(em, {
          ...addressDto,
          countryId,
          addressLine1,
          city,
        });
        location.addressId = address.id;
      }

      em.assign(location, {
        ...this.definedOnly(locationFields),
        updatedAt: new Date(),
      });
      await em.flush();

      this.logger.info(`Location '${location.id}' updated successfully`);

      return this.findLocationDetailOrFail(em, businessId, location.id);
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          'Could not update business location due to a unique constraint conflict',
        );
      }
      throw e;
    }
  }

  // DTO class fields are always defined (ES2022+ class fields), so drop the
  // undefined ones to avoid overwriting columns the client didn't send
  private definedOnly<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }

  // Staff tokens carry businessId; platform users own a business via their subscription
  private async resolveUserBusinessId(
    em: EntityManager,
    user: AuthUserPayload,
  ): Promise<string> {
    if (user.businessId) {
      return user.businessId;
    }

    const subscription = await em.findOne(Subscription, { userId: user.sub });

    const business = subscription
      ? await em.findOne(Business, {
          subscriptionId: subscription.id,
          deletedAt: null,
        })
      : null;

    if (!business) {
      throw new NotFoundException('Business not found for the current user');
    }

    return business.id;
  }

  //admin - paginated list of all businesses
  async findAllBusiness(query: BusinessFilterQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
    const where: FilterQuery<Business> = { deletedAt: null };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.industryTypeId) {
      where.industryTypeId = query.industryTypeId;
    }

    if (query.search) {
      const term = `%${query.search}%`;
      where.$or = [
        { businessName: { $ilike: term } },
        { businessEmail: { $ilike: term } },
        { displayId: { $ilike: term } },
      ];
    }

    const [data, total] = await this.em.findAndCount(Business, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
    });

    return { data, total, page, limit };
  }

  //admin
  async findBusinessById(
    businessId: string,
    query: BusinessDetailQueryDto = {},
  ) {
    return this.findBusinessDetail(this.em, businessId, query);
  }

  //customer
  async findOwnBusiness(
    user: AuthUserPayload,
    query: BusinessDetailQueryDto = {},
  ) {
    const businessId = await this.resolveUserBusinessId(this.em, user);
    return this.findBusinessDetail(this.em, businessId, query);
  }

  // `meta` is only added when asked for; null if the business has none yet
  private async findBusinessDetail(
    em: EntityManager,
    businessId: string,
    query: BusinessDetailQueryDto,
  ) {
    const business = await this.findBusinessOrFail(em, businessId);

    if (!query.includeMeta) {
      return business;
    }

    const meta = await em.findOne(BusinessMeta, { businessId });

    return { ...wrap(business).toObject(), meta };
  }

  //admin
  async findBusinessLocations(businessId: string) {
    await this.findBusinessOrFail(this.em, businessId);
    return this.findLocationsWithAddress(this.em, businessId);
  }

  //customer
  async findOwnBusinessLocations(user: AuthUserPayload) {
    const businessId = await this.resolveUserBusinessId(this.em, user);
    return this.findLocationsWithAddress(this.em, businessId);
  }

  //admin
  async findBusinessLocationById(businessId: string, locationId: string) {
    return this.findLocationDetailOrFail(this.em, businessId, locationId);
  }

  private async findLocationDetailOrFail(
    em: EntityManager,
    businessId: string,
    locationId: string,
  ) {
    const [location] = await this.findLocationsWithAddress(
      em,
      businessId,
      locationId,
    );

    if (!location) {
      throw new NotFoundException('Business location not found');
    }

    return location;
  }

  //customer
  async findOwnBusinessLocationById(user: AuthUserPayload, locationId: string) {
    const businessId = await this.resolveUserBusinessId(this.em, user);
    return this.findBusinessLocationById(businessId, locationId);
  }

  private async findBusinessOrFail(
    em: EntityManager,
    businessId: string,
  ): Promise<Business> {
    const business = await em.findOne(Business, {
      id: businessId,
      deletedAt: null,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  // addressId/locationTypeId are mapToPk, so addresses and type names are
  // loaded in one extra query each and attached
  private async findLocationsWithAddress(
    em: EntityManager,
    businessId: string,
    locationId?: string,
  ) {
    const locations = await em.find(
      BusinessLocation,
      {
        businessId,
        deletedAt: null,
        ...(locationId ? { id: locationId } : {}),
      },
      { orderBy: { createdAt: 'ASC' } },
    );

    const addressIds = locations
      .map((location) => location.addressId)
      .filter((id): id is string => !!id);

    const addresses = await this.addressService.findAddressesByIds(
      em,
      addressIds,
    );
    const addressById = new Map(addresses.map((a) => [a.id, a]));

    const locationTypeIds = [
      ...new Set(locations.map((location) => location.locationTypeId)),
    ];
    const locationTypes = locationTypeIds.length
      ? await em.find(BusinessLocationType, { id: { $in: locationTypeIds } })
      : [];
    const locationTypeById = new Map(
      locationTypes.map((t) => [t.id, t.locationType]),
    );

    return locations.map((location) => ({
      ...wrap(location).toObject(),
      locationType: locationTypeById.get(location.locationTypeId) ?? null,
      address: location.addressId
        ? (addressById.get(location.addressId) ?? null)
        : null,
    }));
  }

  //admin
  async createBusinessLocationType(dto: BusinessLocationTypeCreateRequestDto) {
    try {
      const newType = this.em.create(BusinessLocationType, {
        locationType: dto.locationType,
        isActive: dto.isActive ?? true,
      });
      await this.em.flush();

      this.logger.info(`Business location type '${newType.id}' created`);
      return newType;
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException('Business location type already exists');
      }
      throw e;
    }
  }

  //admin - all types; customer passes { isActive: true }
  async findAllBusinessLocationType(query: BusinessLocationTypeFilterQueryDto) {
    const where: FilterQuery<BusinessLocationType> = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.locationType = { $ilike: `%${query.search}%` };
    }

    return this.em.find(BusinessLocationType, where, {
      orderBy: { locationType: 'ASC' },
    });
  }

  //admin
  async createIndustryType(dto: IndustryTypeCreateRequestDto) {
    try {
      const newType = this.em.create(IndustryType, {
        industryType: dto.industryType,
      });
      await this.em.flush();

      this.logger.info('Industry type created successfully');
      return newType;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`Industry type already exists`);
      }
      throw e;
    }
  }

  //admin
  async findAllIndustryType(query: IndustryTypeFilterQueryDto) {
    const whereClause: any = {};

    if (query.isActive !== undefined) {
      whereClause.isActive = query.isActive;
    }

    if (query.search) {
      whereClause.industryType = { $ilike: `%${query.search}%` };
    }

    const industryTypes = await this.em.find(IndustryType, whereClause, {
      orderBy: { createdAt: 'DESC' },
    });

    return industryTypes;
  }

  //public - registration form
  async publicFindAllIndustryType() {
    return this.em.find(
      IndustryType,
      { isActive: true },
      { fields: ['id', 'industryType'], orderBy: { industryType: 'ASC' } },
    );
  }

  public findIndustryTypeById = (id: string) => {
    return this.em.findOne(IndustryType, { id: id });
  };

  // Display IDs are short (6 digits), so check for a clash before using one.
  // The DB unique constraint stays as the final guard against races.
  private async generateUniqueDisplayId<T extends { displayId: string }>(
    em: EntityManager,
    entity: EntityName<T>,
    prefix: string,
  ): Promise<string> {
    for (let attempt = 0; attempt < DISPLAY_ID_MAX_ATTEMPTS; attempt++) {
      const displayId = this.generateDisplayId(prefix);
      const taken = await em.count(entity, { displayId } as FilterQuery<T>);

      if (taken === 0) return displayId;
    }

    throw new ConflictException(
      `Could not generate a unique ${prefix} display ID, please try again`,
    );
  }

  private generateDisplayId(prefix: string): string {
    const random = randomInt(0, 1_000_000).toString().padStart(6, '0');

    return `${prefix}-${random}`; // e.g. BUS-004821
  }
}
