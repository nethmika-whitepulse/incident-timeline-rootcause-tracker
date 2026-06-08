import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type EvidenceDocument = HydratedDocument<Evidence>;

export enum EvidenceType { Screenshot = 'screenshot', Log = 'log', Note = 'note' }

@Schema({ timestamps: true })
export class Evidence {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true, enum: EvidenceType })
  type: EvidenceType;

  @Prop()
  filename: string;   // for file uploads

  @Prop()
  filePath: string;   // stored path / URL

  @Prop()
  notes: string;      // investigation notes / log snippets

  @Prop({ required: true })
  uploadedBy: string;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);
