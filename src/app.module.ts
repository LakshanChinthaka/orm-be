import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { entities } from './core/db/mikro-orm.config.js';
import { BusinessModule } from './modules/business/business.module.js';
import { UserModule } from './modules/user/user.module.js';
import { PermissionModule } from './modules/permission/permission.module.js';
import { SubscriptionModule } from './modules/subscription/subscription.module.js';
import { HttpExceptionFilter } from './common/filter/http-exception.filter.js';
import { AllExceptionFilter } from './common/filter/all-exception.filter.js';
import { AppLoggerModule } from './common/logger/logger.module.js';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppLoggerModule,
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('DATABASE_HOST'),
        port: Number(config.get<string>('DATABASE_PORT')),
        dbName: config.get<string>('DATABASE_NAME'),
        user: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        entities,
      }),
    }),
    AuthModule,
    BusinessModule,
    UserModule,
    PermissionModule,
    SubscriptionPlanModule,
    SubscriptionModule,
    PaymentModule,
  ],

  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
