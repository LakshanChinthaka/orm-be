import { Module } from '@nestjs/common';
import { CustomerUserController } from './customer-user.controller.js';
import { UserService } from './user.service.js';
import { AdminUserController } from './admin-user-controller.js';

@Module({
  controllers: [CustomerUserController, AdminUserController],
  providers: [UserService],
})
export class UserModule {}
