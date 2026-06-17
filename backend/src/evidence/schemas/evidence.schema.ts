import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type EvidenceDocument = HydratedDocument<Evidence>;

export enum EvidenceType { Screenshot = 'screenshot', Log = 'log', Note = 'note' }

@Schema({ timestamps: true })
export class Evidence {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Incident', index: true })
  incidentId: Types.ObjectId;

  @Prop({ required: true, enum: EvidenceType })
  type: EvidenceType;

  @Prop({ trim: true })
  filename: string;

  @Prop({ trim: true })
  filePath: string;

  @Prop({ trim: true, maxlength: 5000 })
  notes: string;

  @Prop({ required: true, trim: true })
  uploadedBy: string;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);
