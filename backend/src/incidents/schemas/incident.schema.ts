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
  // status+severity and status-only queries via the left-prefix rule.
  // severity-only queries are not a listed access pattern so no standalone index is needed.
  @Prop({ required: true, enum: Severity })
  severity: Severity;

  // index: true removed — the compound { status, severity } below covers
  // status+severity and status-only queries via the left-prefix rule.
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

// Compound index — the left-prefix rule means this covers:
//   • status-only queries     (?status=Open)
//   • status+severity queries (?status=Open&severity=P1)
// severity-only queries are NOT covered — add a separate index if that becomes a requirement.
IncidentSchema.index({ status: 1, severity: 1 });
IncidentSchema.index({ createdAt: -1 }); // default newest-first sort
