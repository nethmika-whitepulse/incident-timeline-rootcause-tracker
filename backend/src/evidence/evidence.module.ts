import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule }   from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage }    from 'multer';
import { extname }        from 'path';
import { EvidenceController } from './evidence.controller';
import { EvidenceService }    from './evidence.service';
import { Evidence, EvidenceSchema } from './schemas/evidence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evidence.name, schema: EvidenceSchema }]),

    // Configure multer using env vars so UPLOAD_DIR and MAX_FILE_SIZE from
    // .env are actually applied (previously they were defined but never used).
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        storage: diskStorage({
          destination: config.get<string>('UPLOAD_DIR') ?? './uploads',
          filename: (_req, file, cb) => {
            // Unique filename: timestamp + original extension
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
            cb(null, `${unique}${extname(file.originalname)}`);
          },
        }),
        limits: {
          fileSize: config.get<number>('MAX_FILE_SIZE') ?? 10485760, // 10 MB default
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EvidenceController],
  providers:   [EvidenceService],
})
export class EvidenceModule {}
