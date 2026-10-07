import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRoleResponseDto } from './dtos/index.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Permission - Customer Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('app')
export class CustomerPermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('/role')
  async findAllUserRole(): Promise<UserRoleResponseDto[]> {
    return await this.permissionService.findAllUserRole();
  }
}
