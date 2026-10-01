import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanService } from './subscription-plan.service.js';
import {
  SubscriptionFeatureRequest,
  SubscriptionFeatureResponse,
  SubscriptionStatusDto,
  SubscriptionPlanCreateRequest,
  SubscriptionPlanCreateResponse,
  SubscriptionPlanListResponse,
} from './dtos/index.js';
import { AdminPlanFilterDto } from './dtos/admin/subscription-plan-filter-query.dto.js';

@ApiTags('Admin Portal - Subscriptions')
@Controller('admin/subscription-plan')
export class AdminSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionPlanService) {}

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
    @Body() dto: SubscriptionPlanCreateRequest,
  ): Promise<SubscriptionPlanCreateResponse> {
    return this.subscriptionService.createSubscriptionPlan(dto);
  }

  @Get('plan')
  async findAllSubscriptionPlan(
    @Query() filters: AdminPlanFilterDto,
  ): Promise<SubscriptionPlanListResponse[]> {
    return this.subscriptionService.adminFindAllSubscriptionPlan(filters);
  }
}
