import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service.js';
import { CustomerSubscriptionController } from './customer-subscription.controller.js';
import { AdminSubscriptionController } from './admin-subscription.controller.js';

@Module({
  providers: [SubscriptionPlanService],
  controllers: [CustomerSubscriptionController, AdminSubscriptionController],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
