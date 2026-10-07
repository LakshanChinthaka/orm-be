import {
  Catch,
  ExceptionFilter,
  Logger,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      `Exception: ${exception.name}, stack: ${exception.stack}`,
    );

    const responseBody = {
      status: httpStatus,
      message: 'Internal Server Error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
