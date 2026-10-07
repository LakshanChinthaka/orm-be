import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { setupSwagger } from './core/swagger/swagger.config.js';
import cookieParser from 'cookie-parser';
import { enableCors } from './core/cors/cors.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT');

  app.use(cookieParser());

  enableCors(app, configService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  setupSwagger(app);

  await app.listen(port ?? 3000);
}
await bootstrap();
