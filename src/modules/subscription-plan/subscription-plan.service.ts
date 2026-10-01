import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { SubscriptionStatus } from './entities/subscription-status.entity.js';
import { SubscriptionFeature } from './entities/subscription-feature.entity.js';
import { SubscriptionPlan } from './entities/subscription-plan.entity.js';
import { SubscriptionPlanPrice } from './entities/subscription-plan-price.entity.js';
import { SubscriptionHasFeature } from './entities/subscription-has-feature.entity.js';
import { PinoLogger } from 'nestjs-pino';
import {
  SubscriptionFeatureRequest,
  SubscriptionFeatureResponse,
  SubscriptionStatusDto,
  SubscriptionPlanCreateRequest,
  SubscriptionPlanCreateResponse,
  SubscriptionPlanListResponse,
  AdminPlanFilterDto,
  AdminSubscriptionPlanListResponse,
} from './dtos/index.js';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SubscriptionPlanService.name);
  }

  //admin
  async createSubscriptionStatus(
    dto: SubscriptionStatusDto,
  ): Promise<SubscriptionStatusDto> {
    try {
      const newSubscriptionStatus = this.em.create(SubscriptionStatus, {
        subscriptionStatus: dto.subscriptionStatus,
      });
      await this.em.flush();

      this.logger.info('Subscription status created successfully');
      return newSubscriptionStatus;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `Subscription Status ${dto.subscriptionStatus} already exists`,
        );
      }
      throw e;
    }
  }

  //admin
  async createSubscriptionFeature(
    dto: SubscriptionFeatureRequest,
  ): Promise<SubscriptionFeatureResponse> {
    try {
      const newSubscriptionFeature = this.em.create(SubscriptionFeature, {
        subscriptionFeature: dto.subscriptionFeatureName,
      });
      await this.em.flush();

      this.logger.info('Subscription feature created successfully');
      return {
        ...newSubscriptionFeature,
        deletedAt: newSubscriptionFeature.deletedAt ?? null,
      };
    } catch (e: any) {
      throw e;
    }
  }

  // admin and internal
  async findAllSubscriptionFeature(): Promise<SubscriptionFeatureResponse[]> {
    const features = await this.em.find(SubscriptionFeature, {
      isActive: true,
    });
    return features.map((f) => ({ ...f, deletedAt: f.deletedAt ?? null }));
  }

  //admin
  async createSubscriptionPlan(
    dto: SubscriptionPlanCreateRequest,
  ): Promise<SubscriptionPlanCreateResponse> {
    try {
      return await this.em.transactional(async (em) => {
        const plan = em.create(SubscriptionPlan, {
          subscriptionStatus: em.getReference(
            SubscriptionStatus,
            dto.subscriptionStatusId,
          ),
          subscriptionName: dto.subscriptionName,
          description: dto.description,
          trialDays: dto.trialDays ?? 0,
        });

        // Create a SubscriptionPlanPrice record for every price entry in dto.prices
        const prices = dto.prices.map((priceDto) =>
          em.create(SubscriptionPlanPrice, {
            subscriptionPlan: plan,
            billingCycle: priceDto.billingCycle,
            amount: String(priceDto.amount),
            isActive: true,
          }),
        );

        if (dto.subscriptionFeatures?.length > 0) {
          dto.subscriptionFeatures.forEach((feature) => {
            em.create(SubscriptionHasFeature, {
              subscriptionPlan: plan,
              subscriptionFeature: em.getReference(
                SubscriptionFeature,
                feature,
              ),
            });
          });
        }

        await em.flush();

        this.logger.info(`Subscription plan '${plan.id}' created successfully`);

        return {
          id: plan.id,
          subscriptionStatusId: dto.subscriptionStatusId,
          subscriptionName: plan.subscriptionName ?? null,
          description: plan.description,
          trialDays: plan.trialDays,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
          prices: prices.map((p) => ({
            id: p.id,
            billingCycle: p.billingCycle,
            amount: p.amount,
          })),
          subscriptionFeatures: dto.subscriptionFeatures,
        };
      });
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `Subscription plan '${dto.subscriptionName}' already exists.`,
        );
      }
      throw e;
    }
  }

  //admin
  async adminFindAllSubscriptionPlan(
    filters: AdminPlanFilterDto,
  ): Promise<AdminSubscriptionPlanListResponse[]> {
    const whereClause: any = {};

    //'active', 'inactive', 'draft'
    if (filters.status) {
      whereClause.subscriptionStatus = {
        subscriptionStatus: filters.status,
      };
    }

    if (filters.search) {
      whereClause.subscriptionName = { $ilike: `%${filters.search}%` };
    }

    const plans = await this.em.find(SubscriptionPlan, whereClause, {
      populate: [
        'subscriptionStatus',
        'prices',
        'subscriptionHasFeatures.subscriptionFeature',
      ],
      orderBy: { createdAt: 'DESC' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      subscriptionStatusId: plan.subscriptionStatus?.id ?? null,
      subscriptionStatus: plan.subscriptionStatus?.subscriptionStatus ?? null,
      subscription: plan.subscriptionName ?? null,
      description: plan.description,
      trialDays: plan.trialDays,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      deletedAt: plan.deletedAt ?? null,
      prices: plan.prices.getItems().map((price) => ({
        id: price.id,
        billingCycle: price.billingCycle,
        amount: price.amount,
        isActive: price.isActive,
        createdAt: price.createdAt,
        updatedAt: price.updatedAt,
      })),
      subscriptionFeatures: plan.subscriptionHasFeatures
        .getItems()
        .map((link) => ({
          id: link.subscriptionFeature.id,
          name: link.subscriptionFeature.subscriptionFeature,
          isActive: link.subscriptionFeature.isActive,
          createdAt: link.subscriptionFeature.createdAt,
          updatedAt: link.subscriptionFeature.updatedAt,
          deletedAt: link.subscriptionFeature.deletedAt,
        })),
    }));
  }

  //user
  async customerFindAllSubscriptionPlan(): Promise<
    SubscriptionPlanListResponse[]
  > {
    const plans = await this.em.find(
      SubscriptionPlan,
      {
        subscriptionStatus: {
          subscriptionStatus: 'active',
        },
      },
      {
        populate: [
          'subscriptionStatus',
          'prices',
          'subscriptionHasFeatures.subscriptionFeature',
        ],
      },
    );

    return plans.map((plan) => ({
      id: plan.id,
      subscriptionStatusId: plan.subscriptionStatus?.id ?? null,
      subscriptionStatus: plan.subscriptionStatus?.subscriptionStatus ?? null,
      subscription: plan.subscriptionName ?? null,
      description: plan.description,
      trialDays: plan.trialDays,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      prices: plan.prices.getItems().map((price) => ({
        id: price.id,
        billingCycle: price.billingCycle,
        amount: price.amount,
        isActive: price.isActive,
      })),
      subscriptionFeatures: plan.subscriptionHasFeatures
        .getItems()
        .map((link) => ({
          id: link.subscriptionFeature.id,
          name: link.subscriptionFeature.subscriptionFeature,
          isActive: link.subscriptionFeature.isActive,
        })),
    }));
  }

  async findSubscriptionPlan(
    planId: string,
  ): Promise<SubscriptionPlanListResponse> {
    const plan = await this.em.findOne(
      SubscriptionPlan,
      { id: planId },
      {
        populate: [
          'subscriptionStatus',
          'prices',
          'subscriptionHasFeatures.subscriptionFeature',
        ],
      },
    );

    if (!plan) {
      throw new NotFoundException(`Subscription plan '${planId}' not found`);
    }

    return {
      id: plan.id,
      subscriptionStatusId: plan.subscriptionStatus?.id ?? null,
      subscriptionStatus: plan.subscriptionStatus?.subscriptionStatus ?? null,
      subscription: plan.subscriptionName ?? null,
      description: plan.description,
      trialDays: plan.trialDays,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      prices: plan.prices.getItems().map((price) => ({
        id: price.id,
        billingCycle: price.billingCycle,
        amount: price.amount,
        isActive: price.isActive,
        createdAt: price.createdAt,
        updatedAt: price.updatedAt,
      })),
      subscriptionFeatures: plan.subscriptionHasFeatures
        .getItems()
        .map((link) => ({
          id: link.subscriptionFeature.id,
          name: link.subscriptionFeature.subscriptionFeature,
          isActive: link.subscriptionFeature.isActive,
          createdAt: link.subscriptionFeature.createdAt,
          updatedAt: link.subscriptionFeature.updatedAt,
          deletedAt: link.subscriptionFeature.deletedAt,
        })),
    };
  }

  //internal
  public findSubscriptionPlanById = (planId: string) => {
    return this.em.findOne(
      SubscriptionPlan,
      { id: planId },
      {
        populate: ['subscriptionStatus'],
      },
    );
  };
}
