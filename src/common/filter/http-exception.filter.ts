import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? ((exceptionResponse as { message?: unknown }).message ??
          exception.message)
        : exception.message;

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    this.logger.error(`Exception: ${exception.name}, status: ${status}`);

    response.status(status).json(
      isProduction
        ? {
            statusCode: status,
            timestamp: new Date().toISOString(),
            message,
          }
        : {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            name: exception.name,
            stack: exception.stack,
          },
    );
  }
}
