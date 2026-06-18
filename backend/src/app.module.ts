import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as Joi from 'joi';

import { AuthModule }        from './auth/auth.module';
import { IncidentsModule }   from './incidents/incidents.module';
import { TimelineModule }    from './timeline/timeline.module';
import { EvidenceModule }    from './evidence/evidence.module';
import { RcaModule }         from './rca/rca.module';
import { ActionItemsModule } from './action-items/action-items.module';
import { DashboardModule }   from './dashboard/dashboard.module';

@Module({
  imports: [
    // ── Env config ────────────────────────────────────────────────────────────
    // validationSchema ensures the app fails fast at boot if required vars are
    // missing — instead of surfacing as confusing undefined errors at runtime.
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV:       Joi.string().valid('development', 'production', 'test').default('development'),
        PORT:           Joi.number().default(5000),
        MONGO_URI:      Joi.string().required(),
        JWT_SECRET:     Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET:     Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
        CORS_ORIGIN:    Joi.string().default('http://localhost:5173'),
        UPLOAD_DIR:     Joi.string().default('uploads'),
        MAX_FILE_SIZE:  Joi.number().default(10485760),
        LOG_LEVEL:      Joi.string().default('info'),
        LOG_DIR:        Joi.string().default('logs'),
      }),
    }),

    // ── MongoDB ───────────────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    // ── Winston Logging ───────────────────────────────────────────────────────
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const logDir = config.get<string>('LOG_DIR') ?? 'logs';
        return {
          transports: [
            new winston.transports.Console({
              silent: config.get('NODE_ENV') === 'test',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.simple(),
              ),
            }),
            new winston.transports.File({
              filename: path.join(logDir, 'error.log'),
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
            new winston.transports.File({
              filename: path.join(logDir, 'combined.log'),
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
          ],
        };
      },
      inject: [ConfigService],
    }),

    // ── Feature Modules ───────────────────────────────────────────────────────
    AuthModule,
    IncidentsModule,
    TimelineModule,
    EvidenceModule,
    RcaModule,
    ActionItemsModule,
    DashboardModule,
  ],
})
export class AppModule {}
