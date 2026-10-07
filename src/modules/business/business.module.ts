import { Module } from '@nestjs/common';
import { PublicBusinessController } from './public-business.controller.js';
import { CustomerBusinessController } from './customer-business.controller.js';
import { BusinessService } from './business.service.js';
import { AdminBusinessController } from './admin-business.controller.js';
import { AddressModule } from '../address/address.module.js';

@Module({
  imports: [AddressModule],
  controllers: [
    PublicBusinessController,
    CustomerBusinessController,
    AdminBusinessController,
  ],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
