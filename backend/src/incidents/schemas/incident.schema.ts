import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type IncidentDocument = HydratedDocument<Incident>;

export enum Severity { P1 = 'P1', P2 = 'P2', P3 = 'P3', P4 = 'P4' }
export enum IncidentStatus {
  Open         = 'Open',
  Investigating = 'Investigating',
  Resolved     = 'Resolved',
  Closed       = 'Closed',
}

@Schema({ timestamps: true })
export class Incident {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: Severity })
  severity: Severity;

  @Prop({ required: true, enum: IncidentStatus, default: IncidentStatus.Open })
  status: IncidentStatus;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
