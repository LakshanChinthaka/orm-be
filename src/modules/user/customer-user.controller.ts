import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service.js';
import { HearAboutResponseDto } from './dtos/index.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customer Portal - Users')
@Controller('app/user')
export class CustomerUserController {
  constructor(private readonly userService: UserService) {}

  @Get('hear/about')
  async findAllHearAbout(): Promise<HearAboutResponseDto[]> {
    return await this.userService.customerFindAllHearAbout();
  }
}
