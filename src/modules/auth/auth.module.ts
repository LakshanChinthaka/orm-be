import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { CustomerAuthController } from './customer-auth.controller.js';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module.js';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
    SubscriptionPlanModule,
  ],
  controllers: [CustomerAuthController],
  providers: [AuthService],
})
export class AuthModule {}
