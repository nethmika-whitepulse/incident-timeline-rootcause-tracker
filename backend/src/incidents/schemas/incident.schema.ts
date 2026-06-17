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

  // index: true removed — the compound { status, severity } below covers
  // single-field severity queries via its right-side prefix and the
  // standalone index would just add write overhead with no query benefit.
  @Prop({ required: true, enum: Severity })
  severity: Severity;

  // index: true removed — the compound { status, severity } covers
  // status-only queries via the left-prefix rule (MongoDB can use the
  // leftmost field of a compound index for single-field queries).
  @Prop({ required: true, enum: IncidentStatus, default: IncidentStatus.Open })
  status: IncidentStatus;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy: Types.ObjectId;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);

// Compound index — left-prefix rule means this single index covers:
//   • status-only queries  (?status=Open)
//   • severity-only queries (?severity=P1) via right-side field
//   • combined queries     (?status=Open&severity=P1)
IncidentSchema.index({ status: 1, severity: 1 });
IncidentSchema.index({ createdAt: -1 }); // default newest-first sort
