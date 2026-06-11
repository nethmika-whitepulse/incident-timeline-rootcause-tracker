import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── Logging (Winston via nest-winston) ──────────────────────────────────────
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // ── Global Exception Filter ─────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Global Logging Interceptor ──────────────────────────────────────────────
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ── Global Validation Pipe ──────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  // Locked to the frontend origin via env — defaults to localhost:5173 (Vite).
  // Set CORS_ORIGIN in .env for staging/production deployments.
  app.enableCors({
    origin:      process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // ── Global API prefix ───────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Swagger (dev only) ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Incident Tracker API')
      .setDescription('Incident Timeline & Root Cause Tracker')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
}

bootstrap();
