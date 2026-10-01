import { Module } from '@nestjs/common';
import { CustomerBusinessController } from './customer-business.controller.js';
import { BusinessService } from './business.service.js';
import { AdminBusinessController } from './admin-business.controller.js';

@Module({
  controllers: [CustomerBusinessController, AdminBusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
