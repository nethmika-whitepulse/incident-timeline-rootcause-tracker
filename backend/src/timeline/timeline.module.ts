import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimelineController } from './timeline.controller';
import { TimelineService }    from './timeline.service';
import { TimelineEvent, TimelineEventSchema } from './schemas/timeline-event.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: TimelineEvent.name, schema: TimelineEventSchema }])],
  controllers: [TimelineController],
  providers:   [TimelineService],
})
export class TimelineModule {}
