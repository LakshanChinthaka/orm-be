import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service.js';
import {
  AdminHearAboutFilterDto,
  AdminHearAboutRequestDto,
  HearAboutResponseDto,
  AdminUserStatusRequestDto,
  AdminUserStatusResponseDto,
} from './dtos/index.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users - Admin Portal')
@Controller('admin')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Post('user-status')
  async createUserStatus(
    @Body() dto: AdminUserStatusRequestDto,
  ): Promise<AdminUserStatusResponseDto> {
    return await this.userService.createUserStatus(dto);
  }

  @Get('user-status')
  async findAllUserStatus(): Promise<AdminUserStatusResponseDto[]> {
    return await this.userService.findAllUserStatus();
  }

  @Post('hear-about')
  async createHearAbout(
    @Body() dto: AdminHearAboutRequestDto,
  ): Promise<HearAboutResponseDto> {
    return await this.userService.createHearAbout(dto);
  }

  @Get('hear-about')
  async findAllHearAbout(
    @Query() filters: AdminHearAboutFilterDto,
  ): Promise<HearAboutResponseDto[]> {
    return await this.userService.adminFindAllHearAbout(filters);
  }
}
