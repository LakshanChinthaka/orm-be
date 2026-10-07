import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service.js';
import { SubscriptionController } from './subscription.controller.js';
import { CustomerSubscriptionController } from './customer-subscription.controller.js';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module.js';

@Module({
  imports: [SubscriptionPlanModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController, CustomerSubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
