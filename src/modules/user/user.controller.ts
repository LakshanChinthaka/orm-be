import { Body, Controller, Post, Get } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserStatusRequestDto } from './dto/user-status-request.dto.js';
import { UserStatusResponseDto } from './dto/user-status-response.dto.js';
import { HearAboutRequestDto } from './dto/hear-about-request.dto.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('status')
  async createUserStatus(@Body() dto: UserStatusRequestDto) {
    return await this.userService.createUserStatus(dto);
  }

  @Get('status')
  async findAllUserStatus(): Promise<UserStatusResponseDto[]> {
    return await this.userService.findAllUserStatus();
  }

  @Post('hear/about')
  async createHearAbout(@Body() dto: HearAboutRequestDto) {
    return await this.userService.createHearAbout(dto);
  }

  @Get('hear/about')
  async findAllHearAbout(): Promise<HearAboutRequestDto[]> {
    return await this.userService.findAllHearAbout();
  }
}
