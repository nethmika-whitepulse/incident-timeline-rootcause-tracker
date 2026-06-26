import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const name = exception instanceof Error ? exception.name : '';
    const code = (exception as any)?.code;

    // ── Mongoose ValidationError → 400 ─────────────────────────────────────
    if (name === 'ValidationError') {
      const errs = (exception as any).errors ?? {};
      const first = Object.values(errs)[0] as any;
      const message = first?.message ?? 'Validation failed';
      this.logger.warn(`${req.method} ${req.url} → 400: ${message}`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false, statusCode: 400, message,
        path: req.url, timestamp: new Date().toISOString(),
      });
    }

    // ── MongoDB duplicate key → 409 ─────────────────────────────────────────
    if (name === 'MongoServerError' && code === 11000) {
      const message = 'A record already exists for this incident.';
      this.logger.warn(`${req.method} ${req.url} → 409: ${message}`);
      return res.status(HttpStatus.CONFLICT).json({
        success: false, statusCode: 409, message,
        path: req.url, timestamp: new Date().toISOString(),
      });
    }

    // ── NestJS HttpException ────────────────────────────────────────────────
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error(`${req.method} ${req.url} → ${status}: ${message}`);

    res.status(status).json({
      success: false, statusCode: status, message,
      path: req.url, timestamp: new Date().toISOString(),
    });
  }
}
