import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { PinoLogger } from 'nestjs-pino';
import { SubscriptionCreateRequestDto } from './dtos/index.js';
import { Subscription } from './entities/subscription.entity.js';
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service.js';

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
  async createSubscription(dto: SubscriptionCreateRequestDto) {
    //need to check if user has
    const [existingSubscriptionUser, existingSubscriptionPlan] =
      await Promise.all([
        this.findSubscriptionByUserId(dto.userId),
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

    // const newSubscriptionStatus = this.em.create(Subscription, {
    //   userId: dto.userId,
    //   subscriptionPlanPriceId: dto.subscriptionPlanPriceId,
    //   paymentMethodId: dto.paymentMethodId,
    //   trialStartAt: dto.trialStartAt,
    //   trialEndAt: dto.trialEndAt,
    //   // billingStartAt: new
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });
    //
    // await this.em.flush();
  }

  private findSubscriptionByUserId = (userId: string) => {
    return this.em.findOne(Subscription, { userId: userId });
  };
}
