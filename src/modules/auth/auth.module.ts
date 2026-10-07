import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { CustomerAuthController } from './customer-auth.controller.js';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module.js';
import { SubscriptionModule } from '../subscription/subscription.module.js';
import { BusinessModule } from '../business/business.module.js';
import { UserModule } from '../user/user.module.js';
import { AdminAuthController } from './admin-auth.controller.js';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      // Global so JwtAuthGuard can be used from any module's controllers
      global: true,
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
    SubscriptionModule,
    BusinessModule,
    UserModule,
  ],
  controllers: [CustomerAuthController, AdminAuthController],
  providers: [AuthService],
})
export class AuthModule {}
