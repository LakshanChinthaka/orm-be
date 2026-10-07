import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service.js';
import { CountryCreateDto, CountryFilterQueryDto } from './dtos/index.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard.js';

@ApiTags('Address - Admin Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/address')
export class AdminAddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('country')
  async createCountry(@Body() dto: CountryCreateDto) {
    return this.addressService.createCountry(dto);
  }

  @Get('country')
  async findAllCountry(@Query() query: CountryFilterQueryDto) {
    return this.addressService.findAllCountry(query);
  }
}
