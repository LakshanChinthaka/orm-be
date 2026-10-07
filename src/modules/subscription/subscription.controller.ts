import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service.js';
import { SubscriptionCreateRequestDto } from './dtos/index.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard.js';

// Registration creates subscriptions internally; creating one directly is admin-only
@ApiTags('Subscriptions - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async createSubscription(@Body() dto: SubscriptionCreateRequestDto) {
    return this.subscriptionService.createSubscription(dto);
  }
}
