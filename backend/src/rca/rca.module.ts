import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RcaController } from './rca.controller';
import { RcaService }    from './rca.service';
import { Rca, RcaSchema } from './schemas/rca.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Rca.name, schema: RcaSchema }])],
  controllers: [RcaController],
  providers:   [RcaService],
})
export class RcaModule {}
