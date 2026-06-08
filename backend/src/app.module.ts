import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

import { AuthModule }        from './auth/auth.module';
import { IncidentsModule }   from './incidents/incidents.module';
import { TimelineModule }    from './timeline/timeline.module';
import { EvidenceModule }    from './evidence/evidence.module';
import { RcaModule }         from './rca/rca.module';
import { ActionItemsModule } from './action-items/action-items.module';
import { DashboardModule }   from './dashboard/dashboard.module';

@Module({
  imports: [
    // ── Env config (available globally) ──────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

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
