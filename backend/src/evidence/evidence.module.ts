import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule }   from '@nestjs/platform-express';
import { EvidenceController } from './evidence.controller';
import { EvidenceService }    from './evidence.service';
import { Evidence, EvidenceSchema } from './schemas/evidence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evidence.name, schema: EvidenceSchema }]),
    MulterModule.register({ dest: process.env.UPLOAD_DIR ?? './uploads' }),
  ],
  controllers: [EvidenceController],
  providers:   [EvidenceService],
})
export class EvidenceModule {}
