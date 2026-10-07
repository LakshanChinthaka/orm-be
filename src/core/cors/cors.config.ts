import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function enableCors(
  app: INestApplication,
  configService: ConfigService,
) {
  const allowedOrigins = [
    configService.get<string>('CUSTOMER_PORTAL_URL', 'http://localhost:5173'),
    configService.get<string>('ADMIN_PORTAL_URL', 'http://localhost:5174'),
    configService.get<string>('SWAGGER_DOC', 'http://localhost:3000'),
  ];

  app.enableCors({
    origin: (
      origin: string,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // @ts-ignore
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });
}
