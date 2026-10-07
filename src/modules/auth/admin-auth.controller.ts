import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, UserType } from './auth.service.js';
import { ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  UserSignInDto,
} from './dtos/index.js';
import type { Request, Response } from 'express';

@ApiTags('Auth - Admin Portal')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body() dto: UserSignInDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = req.ip || '127.0.0.1';
    const agent = req.headers['user-agent'] || 'Unknown';

    return this.authService.signIn(dto, ip, agent, res);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: Request, @Res() res: Response) {
    return this.authService.signOut(req, res);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return this.authService.forgotPassword(
      dto.username,
      dto.userType as UserType,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.resetPassword(dto.token, dto.newPass);
  }
}
