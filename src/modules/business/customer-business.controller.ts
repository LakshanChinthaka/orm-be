import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthUserPayload, BusinessService } from './business.service.js';
import {
  BusinessDetailQueryDto,
  BusinessLocationCreateRequestDto,
  BusinessLocationTypeFilterQueryDto,
  BusinessLocationUpdateRequestDto,
  BusinessUpdateRequestDto,
} from './dtos/index.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Business - Customer Portal ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('app/business')
export class CustomerBusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  async findBusiness(
    @Req() req: Request,
    @Query() query: BusinessDetailQueryDto,
  ) {
    return this.businessService.findOwnBusiness(
      (req as any).user as AuthUserPayload,
      query,
    );
  }

  // Only active types are offered to customers
  @Get('location-type')
  async findAllBusinessLocationType(
    @Query() query: BusinessLocationTypeFilterQueryDto,
  ) {
    return this.businessService.findAllBusinessLocationType({
      ...query,
      isActive: true,
    });
  }

  @Get('location')
  async findBusinessLocations(@Req() req: Request) {
    return this.businessService.findOwnBusinessLocations(
      (req as any).user as AuthUserPayload,
    );
  }

  @Get('location/:locationId')
  async findBusinessLocationById(
    @Req() req: Request,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.businessService.findOwnBusinessLocationById(
      (req as any).user as AuthUserPayload,
      locationId,
    );
  }

  @Patch()
  async updateBusiness(
    @Req() req: Request,
    @Body() dto: BusinessUpdateRequestDto,
  ) {
    return this.businessService.updateOwnBusiness(
      (req as any).user as AuthUserPayload,
      dto,
    );
  }

  @Post('location')
  async createBusinessLocation(
    @Req() req: Request,
    @Body() dto: BusinessLocationCreateRequestDto,
  ) {
    return this.businessService.createOwnBusinessLocation(
      (req as any).user as AuthUserPayload,
      dto,
    );
  }

  @Patch('location/:locationId')
  async updateBusinessLocation(
    @Req() req: Request,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Body() dto: BusinessLocationUpdateRequestDto,
  ) {
    return this.businessService.updateOwnBusinessLocation(
      (req as any).user as AuthUserPayload,
      locationId,
      dto,
    );
  }
}
