import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type TimelineEventDocument = HydratedDocument<TimelineEvent>;

@Schema({ timestamps: true })
export class TimelineEvent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 1000 })
  description: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  author: string;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);

// Compound index — covers find({ incidentId }).sort({ timestamp: 1 }) in a
// single index scan. Without this, MongoDB filters by incidentId then sorts
// the matching documents in memory (SORT stage in explain output).
TimelineEventSchema.index({ incidentId: 1, timestamp: 1 });
