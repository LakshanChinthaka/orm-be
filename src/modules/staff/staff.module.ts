import { Module } from '@nestjs/common';
import { CustomerStaffController } from './customer-staff.controller.js';
import { StaffService } from './staff.service.js';

@Module({
  controllers: [CustomerStaffController],
  providers: [StaffService],
})
export class StaffModule {}
