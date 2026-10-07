import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { PinoLogger } from 'nestjs-pino';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import {
  MySubscriptionResponseDto,
  SubscriptionCreateRequestDto,
  SubscriptionStatus,
} from './dtos/index.js';
import { Subscription } from './entities/subscription.entity.js';
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service.js';
import { SubscriptionPlanPrice } from '../subscription-plan/entities/subscription-plan-price.entity.js';
import { SubscriptionHasFeature } from '../subscription-plan/entities/subscription-has-feature.entity.js';
import { Business } from '../business/entities/business.entity.js';
import type { AuthUserPayload } from '../business/business.service.js';

enum BillingInterval {
  MONTH = 'monthly',
  QUARTER = 'quarterly',
  YEAR = 'yearly',
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {
    this.logger.setContext(SubscriptionService.name);
  }

  //internal
  async createSubscription(
    dto: SubscriptionCreateRequestDto,
  ): Promise<Subscription> {
    return this.em.transactional((em) =>
      this.createSubscriptionWithEm(em, dto),
    );
  }

  //internal - callable within an existing transaction (e.g. user registration)
  async createSubscriptionWithEm(
    em: EntityManager,
    dto: SubscriptionCreateRequestDto,
  ): Promise<Subscription> {
    const [existingSubscriptionUser, existingSubscriptionPlan] =
      await Promise.all([
        em.findOne(Subscription, { userId: dto.userId }),
        this.subscriptionPlanService.findSubscriptionPlanById(
          dto.subscriptionPlanId,
        ),
      ]);

    if (existingSubscriptionUser) {
      throw new ConflictException(
        `A subscription account already exists for user ID ${dto.userId}`,
      );
    }

    if (!existingSubscriptionPlan) {
      throw new NotFoundException(
        `Subscription plan '${dto.subscriptionPlanId}' not found`,
      );
    }

    //priceId actually belongs to that plan.
    const subscriptionPlanPrice = existingSubscriptionPlan.prices
      .getItems()
      .find((price) => price.id === dto.subscriptionPlanPriceId);

    if (!subscriptionPlanPrice) {
      throw new NotFoundException(
        `Subscription plan price '${dto.subscriptionPlanPriceId}' not found`,
      );
    }

    const trialDays = existingSubscriptionPlan.trialDays ?? 0;
    const trialStartAt = trialDays > 0 ? new Date() : null;
    const trialEndAt = this.getTrialEndDate(trialDays, trialStartAt);
    const billingStartAt = trialEndAt ?? new Date();
    const nextBillingDate = this.getNextBillingDate(
      billingStartAt,
      subscriptionPlanPrice.billingCycle,
    );

    try {
      const newSubscription = em.create(Subscription, {
        userId: dto.userId,
        subscriptionPlanPriceId: dto.subscriptionPlanPriceId,
        paymentMethodId: dto.paymentMethodId,
        trialStartAt,
        trialEndAt,
        billingStartAt,
        nextBillingDate,
        lastPayAmount: null,
        displayId: this.generateDisplayId('SUB'),
      });

      await em.flush();

      this.logger.info(
        `Subscription '${newSubscription.id}' created successfully`,
      );

      return newSubscription;
    } catch (e: unknown) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          'Could not create subscription due to a unique constraint conflict',
        );
      }
      throw e;
    }
  }

  //customer - owners reach it via their user id, staff via their business
  async findOwnSubscription(
    user: AuthUserPayload,
  ): Promise<MySubscriptionResponseDto> {
    let subscription: Subscription | null;

    if (user.businessId) {
      const business = await this.em.findOne(Business, {
        id: user.businessId,
        deletedAt: null,
      });
      subscription = business
        ? await this.em.findOne(Subscription, { id: business.subscriptionId })
        : null;
    } else {
      subscription = await this.em.findOne(Subscription, { userId: user.sub });
    }

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found for the current user',
      );
    }

    const price = await this.em.findOneOrFail(
      SubscriptionPlanPrice,
      { id: subscription.subscriptionPlanPriceId },
      { populate: ['subscriptionPlan'] },
    );
    const plan = price.subscriptionPlan;

    const features = plan
      ? await this.em.find(
          SubscriptionHasFeature,
          {
            subscriptionPlan: plan.id,
            subscriptionFeature: { isActive: true },
          },
          { populate: ['subscriptionFeature'] },
        )
      : [];

    const now = dayjs();
    const trialDaysLeft =
      subscription.trialEndAt && now.isBefore(subscription.trialEndAt)
        ? Math.ceil(dayjs(subscription.trialEndAt).diff(now, 'day', true))
        : 0;

    return {
      id: subscription.id,
      displayId: subscription.displayId,
      status: this.getSubscriptionStatus(subscription, trialDaysLeft),
      plan: {
        id: plan?.id ?? '',
        name: plan?.subscriptionName ?? null,
        description: plan?.description ?? '',
      },
      price: {
        id: price.id,
        billingCycle: price.billingCycle,
        amount: price.amount,
      },
      features: features.map((link) => ({
        id: link.subscriptionFeature.id,
        name: link.subscriptionFeature.subscriptionFeature,
      })),
      trialStartAt: subscription.trialStartAt ?? null,
      trialEndAt: subscription.trialEndAt ?? null,
      trialDaysLeft,
      billingStartAt: subscription.billingStartAt,
      nextBillingDate: subscription.nextBillingDate,
    };
  }

  private getSubscriptionStatus(
    subscription: Subscription,
    trialDaysLeft: number,
  ): SubscriptionStatus {
    if (subscription.cancelledAt) return 'cancelled';
    if (subscription.pausedUntil && dayjs().isBefore(subscription.pausedUntil))
      return 'paused';
    if (trialDaysLeft > 0) return 'trialing';
    return 'active';
  }

  private generateDisplayId(prefix: string): string {
    const random = randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
    return `${prefix}-${random}`;
  }

  private getNextBillingDate(fromDate: Date, billingCycle: string): Date {
    switch (billingCycle) {
      case BillingInterval.MONTH:
        return dayjs(fromDate).add(1, 'month').toDate();
      case BillingInterval.QUARTER:
        return dayjs(fromDate).add(3, 'month').toDate();
      case BillingInterval.YEAR:
        return dayjs(fromDate).add(1, 'year').toDate();
      default:
        throw new BadRequestException(
          `Unsupported billing cycle '${billingCycle}'`,
        );
    }
  }

  private getTrialEndDate = (trialDays: number, trialStartAt: Date | null) => {
    return trialDays > 0
      ? dayjs(trialStartAt).add(trialDays, 'day').toDate()
      : null;
  };
}
