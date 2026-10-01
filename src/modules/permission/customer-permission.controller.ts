import { Controller, Get } from '@nestjs/common';
import { PermissionService } from './permission.service.js';
import { ApiTags } from '@nestjs/swagger';
import { UserRoleResponseDto } from './dtos/index.js';

@ApiTags('Customer Portal - Permission')
@Controller('app')
export class CustomerPermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/role')
  async findAllUserRole(): Promise<UserRoleResponseDto[]> {
    return await this.permissionService.findAllUserRole();
  }
}
