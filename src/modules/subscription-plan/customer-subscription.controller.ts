import { Get, Controller } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service.js';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanListResponse } from './dtos/index.js';

@ApiTags('Subscriptions plan - Customer Portal')
@Controller('app/subscription-plan')
export class CustomerSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionPlanService) {}

  @Get('plan')
  async findAllSubscriptionPlan(): Promise<SubscriptionPlanListResponse[]> {
    return this.subscriptionService.customerFindAllSubscriptionPlan();
  }
}
