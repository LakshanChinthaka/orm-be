import { Body, Get, Controller, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service.js';
import { SubscriptionStatusDto } from './dto/subscription-status.dto.js';
import { SubscriptionFeatureRequest } from './dto/subscription-feature-request.js';
import { SubscriptionFeatureResponse } from './dto/subscription-feature-response.js';
import { SubscriptionPlanRequest } from './dto/subscription-plan-request.dto.js';
import { SubscriptionPlanResponse } from './dto/subscription-plan-response.dto.js';
import { SubscriptionPlanListResponse } from './dto/subscription-plan-list-response.dto.js';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('status')
  async createSubscriptionStatus(
    @Body() dto: SubscriptionStatusDto,
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionService.createSubscriptionStatus(dto);
  }

  @Post('feature')
  async createSubscriptionFeature(
    @Body() dto: SubscriptionFeatureRequest,
  ): Promise<SubscriptionFeatureResponse> {
    return this.subscriptionService.createSubscriptionFeature(dto);
  }

  @Get('feature')
  async findAllSubscriptionFeature(): Promise<SubscriptionFeatureResponse[]> {
    return this.subscriptionService.findAllSubscriptionFeature();
  }

  @Post('plan')
  async createSubscriptionPlan(
    @Body() dto: SubscriptionPlanRequest,
  ): Promise<SubscriptionPlanResponse> {
    return this.subscriptionService.createSubscriptionPlan(dto);
  }

  @Get('plan')
  async findAllSubscriptionPlan(): Promise<SubscriptionPlanListResponse[]> {
    return this.subscriptionService.findAllSubscriptionPlan();
  }
}
