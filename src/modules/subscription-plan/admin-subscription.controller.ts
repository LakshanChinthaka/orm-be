import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanService } from './subscription-plan.service.js';
import {
  SubscriptionFeatureRequest,
  SubscriptionFeatureResponse,
  SubscriptionStatusDto,
  SubscriptionPlanCreateRequest,
  SubscriptionPlanCreateResponse,
  SubscriptionPlanListResponse,
  AdminPlanFilterDto,
  SubscriptionPlanStatusResponse,
  SubscriptionPlanFeaturedUpdateRequestDto,
} from './dtos/index.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard.js';

@ApiTags('Subscriptions Plan - Admin Portal')
@Controller('admin/subscription-plan')
export class AdminSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionPlanService) {}

  @Post('status')
  async createSubscriptionStatus(
    @Body() dto: SubscriptionStatusDto,
  ): Promise<SubscriptionStatusDto> {
    return this.subscriptionService.createSubscriptionStatus(dto);
  }

  @Get('status')
  async findAllSubscriptionPlanStatus(): Promise<
    SubscriptionPlanStatusResponse[]
  > {
    return this.subscriptionService.findAllSubscriptionPlanStatus();
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

  @Patch('plan/:planId/featured')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async updateSubscriptionPlanFeatured(
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: SubscriptionPlanFeaturedUpdateRequestDto,
  ) {
    return this.subscriptionService.updateSubscriptionPlanFeatured(
      planId,
      dto.isFeatured,
    );
  }
}
