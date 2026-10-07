import { Body, Controller, Get, Post } from '@nestjs/common';
import { PermissionService } from './permission.service.js';
import { ApiTags } from '@nestjs/swagger';
import { UserRoleRequestDto, UserRoleResponseDto } from './dtos/index.js';

@ApiTags('Permission - Admin Portal')
@Controller('admin')
export class AdminPermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('/role')
  async createUserRole(
    @Body() dto: UserRoleRequestDto,
  ): Promise<UserRoleResponseDto> {
    return await this.permissionService.createUserRole(dto);
  }

  @Get('/role')
  async findAllUserRole(): Promise<UserRoleResponseDto[]> {
    return await this.permissionService.findAllUserRole();
  }
}
