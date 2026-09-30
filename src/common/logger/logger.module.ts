import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',

        redact: ['req.headers.authorization', 'req.body.password'],

        genReqId: (req) => {
          return req.headers['x-request-id']?.toString() ?? crypto.randomUUID();
        },

        customProps: () => ({
          service: process.env.SERVICE_NAME ?? 'oms',
          environment: process.env.NODE_ENV ?? 'development',
        }),

        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          }),

          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },

        customSuccessMessage: (req, res) =>
          `${req.method} ${req.url} ${res.statusCode}`,

        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,

        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },

        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class AppLoggerModule {}
