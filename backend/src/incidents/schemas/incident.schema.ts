import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type IncidentDocument = HydratedDocument<Incident>;

export enum Severity { P1 = 'P1', P2 = 'P2', P3 = 'P3', P4 = 'P4' }
export enum IncidentStatus {
  Open          = 'Open',
  Investigating = 'Investigating',
  Resolved      = 'Resolved',
  Closed        = 'Closed',
}

@Schema({ timestamps: true })
export class Incident {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 200 })
  title: string;

  @Prop({ trim: true, maxlength: 2000 })
  description: string;

  @Prop({ required: true, enum: Severity, index: true })
  severity: Severity;

  @Prop({ required: true, enum: IncidentStatus, default: IncidentStatus.Open, index: true })
  status: IncidentStatus;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy: Types.ObjectId;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);

// Compound indexes — single-field @Prop indexes above cover simple queries;
// these cover the multi-field query patterns in the service and dashboard.
IncidentSchema.index({ status: 1, severity: 1 }); // filtered list: ?status=Open&severity=P1
IncidentSchema.index({ createdAt: -1 });           // default sort: newest first
