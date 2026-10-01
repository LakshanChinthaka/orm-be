import { Body, Controller, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service.js';
import { SubscriptionCreateRequestDto } from './dtos/index.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customer Portal - Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async createSubscription(@Body() dto: SubscriptionCreateRequestDto) {
    return this.subscriptionService.createSubscription(dto);
  }
}
