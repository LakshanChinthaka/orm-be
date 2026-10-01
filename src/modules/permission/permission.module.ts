import { Module } from '@nestjs/common';
import { AdminPermissionController } from './admin-permission.controller.js';
import { CustomerPermissionController } from './customer-permission.controller.js';
import { PermissionService } from './permission.service.js';

@Module({
  controllers: [AdminPermissionController, CustomerPermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
