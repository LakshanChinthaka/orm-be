import { Module } from '@nestjs/common';
import { CustomerAddressController } from './customer-address.controller.js';
import { AddressService } from './address.service.js';
import { AdminAddressController } from './admin-address.controller.js';

@Module({
  controllers: [CustomerAddressController, AdminAddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
