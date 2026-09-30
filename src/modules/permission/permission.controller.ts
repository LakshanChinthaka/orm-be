import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRoleRequestDto } from '../permission/dto/user-role-request.dto.js';
import { UserRoleResponseDto } from '../permission/dto/user-role-response.dto.js';
import { PermissionService } from './permission.service.js';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('status')
  async createUserStatus(
    @Body() dto: UserRoleRequestDto,
  ): Promise<UserRoleRequestDto> {
    return await this.permissionService.createUserPermission(dto);
  }

  @Get('status')
  async findAllUserStatus(): Promise<UserRoleResponseDto[]> {
    return await this.permissionService.findAllUserStatus();
  }
}
