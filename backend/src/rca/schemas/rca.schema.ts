import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type RcaDocument = HydratedDocument<Rca>;

@Schema({ timestamps: true })
export class Rca {
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true })
  rootCause: string;

  @Prop([String])
  contributingFactors: string[];

  @Prop({ required: true })
  resolution: string;

  @Prop()
  lessonsLearned: string;
}

export const RcaSchema = SchemaFactory.createForClass(Rca);
