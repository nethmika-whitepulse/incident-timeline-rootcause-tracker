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

  // null guard (s != null) runs first — Mongoose can cast mixed input before
  // validation fires, so a null/undefined item would throw TypeError on .trim()
  // without it. The guard short-circuits and returns a clean validation error instead.
  @Prop({
    type: [String],
    validate: {
      validator: (arr: string[]) =>
        arr.every(s => s != null && s.trim().length > 0 && s.length <= 500),
      message: 'Each contributing factor must be non-empty and under 500 characters',
    },
  })
  contributingFactors: string[];

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 2000 })
  resolution: string;

  @Prop({ trim: true, maxlength: 2000 })
  lessonsLearned: string;
}

export const RcaSchema = SchemaFactory.createForClass(Rca);
