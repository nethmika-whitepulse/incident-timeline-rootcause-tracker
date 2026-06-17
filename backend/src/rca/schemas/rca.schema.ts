import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type RcaDocument = HydratedDocument<Rca>;

@Schema({ timestamps: true })
export class Rca {
  // unique: true creates the index automatically — one RCA per incident
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 2000 })
  rootCause: string;

  @Prop([String])
  contributingFactors: string[];

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 2000 })
  resolution: string;

  @Prop({ trim: true, maxlength: 2000 })
  lessonsLearned: string;
}

export const RcaSchema = SchemaFactory.createForClass(Rca);
