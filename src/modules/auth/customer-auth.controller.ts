import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserRegisterDto } from './dtos/auth.register.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customer Portal - Auth')
@Controller('app/auth')
export class CustomerAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: UserRegisterDto) {
    return this.authService.userRegister(createAuthDto);
  }
}
