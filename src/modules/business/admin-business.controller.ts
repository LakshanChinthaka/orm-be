import {
  Body,
  Controller,
  Post,
  Query,
  Get,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { BusinessService } from './business.service.js';
import {
  BusinessDetailQueryDto,
  BusinessFilterQueryDto,
  BusinessLocationCreateRequestDto,
  BusinessLocationTypeCreateRequestDto,
  BusinessLocationTypeFilterQueryDto,
  IndustryTypeCreateRequestDto,
  IndustryTypeFilterQueryDto,
  StatusUpdateRequestDto,
} from './dtos/index.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permission.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard.js';

@ApiTags('Business - Admin Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/business')
export class AdminBusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('industry-type')
  async createIndustryType(@Body() dto: IndustryTypeCreateRequestDto) {
    return this.businessService.createIndustryType(dto);
  }

  @Get('industry-type')
  async findAllIndustryType(@Query() query: IndustryTypeFilterQueryDto) {
    return this.businessService.findAllIndustryType(query);
  }

  @Post('location-type')
  async createBusinessLocationType(
    @Body() dto: BusinessLocationTypeCreateRequestDto,
  ) {
    return this.businessService.createBusinessLocationType(dto);
  }

  @Get('location-type')
  async findAllBusinessLocationType(
    @Query() query: BusinessLocationTypeFilterQueryDto,
  ) {
    return this.businessService.findAllBusinessLocationType(query);
  }

  @Get()
  async findAllBusiness(@Query() query: BusinessFilterQueryDto) {
    return this.businessService.findAllBusiness(query);
  }

  @Get(':businessId')
  async findBusinessById(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query() query: BusinessDetailQueryDto,
  ) {
    return this.businessService.findBusinessById(businessId, query);
  }

  @Get(':businessId/location')
  async findBusinessLocations(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.businessService.findBusinessLocations(businessId);
  }

  @Get(':businessId/location/:locationId')
  async findBusinessLocationById(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    return this.businessService.findBusinessLocationById(
      businessId,
      locationId,
    );
  }

  @Post(':businessId/location')
  async createBusinessLocation(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: BusinessLocationCreateRequestDto,
  ) {
    return this.businessService.createBusinessLocation(businessId, dto);
  }

  @Patch(':businessId/status')
  async updateBusinessStatus(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: StatusUpdateRequestDto,
  ) {
    return this.businessService.updateBusinessStatus(businessId, dto.isActive);
  }

  @Patch(':businessId/location/:locationId/status')
  async updateBusinessLocationStatus(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Body() dto: StatusUpdateRequestDto,
  ) {
    return this.businessService.updateBusinessLocationStatus(
      businessId,
      locationId,
      dto.isActive,
    );
  }

  @UseGuards(PermissionsGuard)
  @Permissions('orders:read')
  @Get('testing')
  async testing() {
    return 'You have access to the testing API.';
  }
}
