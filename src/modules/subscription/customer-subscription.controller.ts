import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service.js';
import { MySubscriptionResponseDto } from './dtos/index.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthUserPayload } from '../business/business.service.js';

@ApiTags('Subscriptions - Customer Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('app/subscription')
export class CustomerSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // The subscription of the signed-in user's business (owners and staff)
  @Get()
  async findOwnSubscription(
    @Req() req: Request,
  ): Promise<MySubscriptionResponseDto> {
    return this.subscriptionService.findOwnSubscription(
      (req as any).user as AuthUserPayload,
    );
  }
}
