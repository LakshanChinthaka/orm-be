import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  FilterQuery,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { PinoLogger } from 'nestjs-pino';
import {
  AddressCreateDto,
  AddressUpdateDto,
  CountryCreateDto,
  CountryFilterQueryDto,
} from './dtos/index.js';
import { Country } from './entities/country.entity.js';
import { Address } from './entities/address.entity.js';

@Injectable()
export class AddressService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AddressService.name);
  }

  async createCountry(dto: CountryCreateDto) {
    try {
      const newCountry = this.em.create(Country, {
        countryName: dto.countryName,
        countryCode: dto.countryCode,
        isActive: dto.isActive,
      });
      await this.em.flush();

      this.logger.info('Country created successfully');
      return newCountry;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`Country already exists`);
      }
      throw e;
    }
  }

  //admin - all countries; customer passes { isActive: true }
  async findAllCountry(query: CountryFilterQueryDto) {
    const where: FilterQuery<Country> = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      const term = `%${query.search}%`;
      where.$or = [
        { countryName: { $ilike: term } },
        { countryCode: { $ilike: term } },
      ];
    }

    return this.em.find(Country, where, { orderBy: { countryName: 'ASC' } });
  }

  //internal - create an address inside the caller's transaction
  async createAddressWithEm(
    em: EntityManager,
    dto: AddressCreateDto,
  ): Promise<Address> {
    await this.assertCountryExists(em, dto.countryId);

    const newAddress = em.create(Address, {
      countryId: dto.countryId,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2 ?? null,
      city: dto.city,
      region: dto.region ?? null,
      postalCode: dto.postalCode ?? null,
      isActive: dto.isActive ?? true,
    });
    await em.flush();

    this.logger.info({ addressId: newAddress.id }, 'Address created');
    return newAddress;
  }

  //internal - partial update inside the caller's transaction; only defined fields are applied
  async updateAddressWithEm(
    em: EntityManager,
    addressId: string,
    dto: AddressUpdateDto,
  ): Promise<Address> {
    const address = await em.findOne(Address, { id: addressId });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.countryId) {
      await this.assertCountryExists(em, dto.countryId);
    }

    const fields = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    em.assign(address, fields);
    await em.flush();

    this.logger.info({ addressId: address.id }, 'Address updated');
    return address;
  }

  //internal
  async findAddressesByIds(
    em: EntityManager,
    addressIds: string[],
  ): Promise<Address[]> {
    if (addressIds.length === 0) return [];
    return em.find(Address, { id: { $in: addressIds } });
  }

  // Inactive countries can't be used for new or changed addresses
  private async assertCountryExists(
    em: EntityManager,
    countryId: string,
  ): Promise<void> {
    const country = await em.findOne(Country, {
      id: countryId,
      isActive: true,
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }
  }
}
