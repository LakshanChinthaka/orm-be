import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/postgresql';
import { SubscriptionStatus } from './entities/subscription-status.entity.js';
import { SubscriptionFeature } from './entities/subscription-feature.entity.js';
import { SubscriptionPlan } from './entities/subscription-plan.entity.js';
import { SubscriptionPlanPrice } from './entities/subscription-plan-price.entity.js';
import { SubscriptionHasFeature } from './entities/subscription-has-feature.entity.js';
import { SubscriptionStatusDto } from './dto/subscription-status.dto.js';
import { SubscriptionFeatureRequest } from './dto/subscription-feature-request.js';
import { SubscriptionFeatureResponse } from './dto/subscription-feature-response.js';
import { PinoLogger } from 'nestjs-pino';
import { SubscriptionPlanRequest } from './dto/subscription-plan-request.dto.js';
import { SubscriptionPlanResponse } from './dto/subscription-plan-response.dto.js';
import { SubscriptionPlanListResponse } from './dto/subscription-plan-list-response.dto.js';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SubscriptionService.name);
  }

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

  async createSubscriptionFeature(
    dto: SubscriptionFeatureRequest,
  ): Promise<SubscriptionFeatureResponse> {
    try {
      const newSubscriptionFeature = this.em.create(SubscriptionFeature, {
        subscriptionFeature: dto.subscriptionFeatureName,
      });
      await this.em.flush();

      this.logger.info('Subscription feature created successfully');
      return { ...newSubscriptionFeature, deletedAt: newSubscriptionFeature.deletedAt ?? null };
    } catch (e: any) {
      throw e;
    }
  }

  async findAllSubscriptionFeature(): Promise<SubscriptionFeatureResponse[]> {
    const features = await this.em.find(SubscriptionFeature, {
      isActive: true,
    });
    return features.map((f) => ({ ...f, deletedAt: f.deletedAt ?? null }));
  }

  //subscription plan
  async createSubscriptionPlan(
    dto: SubscriptionPlanRequest,
  ): Promise<SubscriptionPlanResponse> {
    try {
      return await this.em.transactional(async (em) => {
        const newSubscriptionPlan = em.create(SubscriptionPlan, {
          subscriptionStatusId: dto.subscriptionStatusId,
          subscriptionName: dto.subscriptionName,
          trialDays: dto.trialDays || 0,
        });
        await em.flush();

        const newSubscriptionPlanPrice = em.create(SubscriptionPlanPrice, {
          subscriptionPlanId: newSubscriptionPlan.id,
          billingCycle: dto.billingCycle,
          amount: String(dto.amount),
        });
        await em.flush();

        if (dto.subscriptionFeatures.length > 0) {
          const links = dto.subscriptionFeatures.map((featureId) =>
            em.create(SubscriptionHasFeature, {
              subscriptionPlanId: newSubscriptionPlan.id,
              subscriptionFeatureId: featureId,
            }),
          );
          await em.flush();
        }

        this.logger.info('Subscription plan created successfully');

        return {
          id: newSubscriptionPlan.id,
          subscriptionStatusId: newSubscriptionPlan.subscriptionStatusId ?? null,
          subscriptionName: newSubscriptionPlan.subscriptionName,
          trialDays: newSubscriptionPlan.trialDays,
          createdAt: newSubscriptionPlan.createdAt,
          updatedAt: newSubscriptionPlan.updatedAt,
          price: {
            id: newSubscriptionPlanPrice.id,
            billingCycle: newSubscriptionPlanPrice.billingCycle,
            amount: newSubscriptionPlanPrice.amount,
          },
          subscriptionFeatures: dto.subscriptionFeatures,
        };
      });
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `Subscription plan '${dto.subscriptionName}' already exists`,
        );
      }
      throw e;
    }
  }

  async findAllSubscriptionPlan(): Promise<SubscriptionPlanListResponse[]> {
    const [plans, prices, featureLinks, features, statuses] =
      await Promise.all([
        this.em.findAll(SubscriptionPlan),
        this.em.find(SubscriptionPlanPrice, { isActive: true }),
        this.em.findAll(SubscriptionHasFeature),
        this.em.find(SubscriptionFeature, { isActive: true }),
        this.em.findAll(SubscriptionStatus),
      ]);

    const featureNameById = new Map(
      features.map((f) => [f.id, f.subscriptionFeature]),
    );
    const statusNameById = new Map(
      statuses.map((s) => [s.id, s.subscriptionStatus]),
    );

    const featuresByPlanId = new Map<string, { id: string; name: string }[]>();
    for (const link of featureLinks) {
      const list = featuresByPlanId.get(link.subscriptionPlanId) ?? [];
      list.push({
        id: link.subscriptionFeatureId,
        name: featureNameById.get(link.subscriptionFeatureId) ?? '',
      });
      featuresByPlanId.set(link.subscriptionPlanId, list);
    }

    const pricesByPlanId = new Map<string, typeof prices>();
    for (const price of prices) {
      if (!price.subscriptionPlanId) continue;
      const planPrices = pricesByPlanId.get(price.subscriptionPlanId) ?? [];
      planPrices.push(price);
      pricesByPlanId.set(price.subscriptionPlanId, planPrices);
    }

    return plans.map((plan) => ({
      id: plan.id,
      subscriptionStatusId: plan.subscriptionStatusId ?? null,
      subscriptionStatus: plan.subscriptionStatusId
        ? (statusNameById.get(plan.subscriptionStatusId) ?? null)
        : null,
      subscription: plan.subscriptionName,
      trialDays: plan.trialDays,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      subscriptionFeatures: featuresByPlanId.get(plan.id) ?? [],
      prices: (pricesByPlanId.get(plan.id) ?? []).map((price) => ({
        id: price.id,
        billingCycle: price.billingCycle,
        amount: price.amount,
      })),
    }));
  }
}
