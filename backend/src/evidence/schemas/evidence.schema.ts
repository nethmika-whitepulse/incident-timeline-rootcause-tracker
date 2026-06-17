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

  // maxlength: 255 matches the common filesystem filename length limit
  @Prop({ trim: true, maxlength: 255 })
  filename: string;

  // maxlength: 2048 aligns with the de-facto URL length limit
  @Prop({ trim: true, maxlength: 2048 })
  filePath: string;

  @Prop({ trim: true, maxlength: 5000 })
  notes: string;

  @Prop({ required: true, trim: true, minlength: 2 })
  uploadedBy: string;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);
