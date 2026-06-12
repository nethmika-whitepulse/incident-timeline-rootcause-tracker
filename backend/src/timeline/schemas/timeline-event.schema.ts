import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type TimelineEventDocument = HydratedDocument<TimelineEvent>;

@Schema({ timestamps: true })
export class TimelineEvent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  author: string;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);
