import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService, UserType } from './auth.service.js';
import { UserRegisterDto } from './dtos/auth.register.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthUserPayload } from '../business/business.service.js';
import {
  AuthMeResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  UserSignInDto,
} from './dtos/index.js';
import type { Request, Response } from 'express';

@ApiTags('Auth - Customer Portal')
@Controller('app/auth')
export class CustomerAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    return this.authService.userRegister(dto);
  }

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

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<AuthMeResponseDto> {
    return this.authService.getMe((req as any).user as AuthUserPayload);
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
