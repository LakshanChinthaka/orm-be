import { Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service.js';
import { CountryFilterQueryDto } from './dtos/index.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Address - Customer Portal')
@Controller('app/address')
export class CustomerAddressController {
  constructor(private readonly addressService: AddressService) {}

  // Only active countries are offered to customers
  @Get('country')
  async findAllCountry(@Query() query: CountryFilterQueryDto) {
    return this.addressService.findAllCountry({ ...query, isActive: true });
  }
}
