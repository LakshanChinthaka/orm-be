import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Order Management System')
    .setDescription('The order management system API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
      description: 'HTTP-Only refresh token cookie',
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      // 1. Forces Swagger UI browser requests to include httpOnly cookies
      requestInterceptor: (req: any) => {
        req.credentials = 'include';
        return req;
      },
      // 2. Persists the Bearer auth token in local storage on page refresh
      persistAuthorization: true,
    },
  });

  SwaggerModule.setup('docs', app, documentFactory);
}
