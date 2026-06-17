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

  // Custom validator guards against empty strings and whitespace-only entries
  // which @Prop([String]) would otherwise accept without complaint.
  @Prop({
    type: [String],
    validate: {
      validator: (arr: string[]) =>
        arr.every(s => s.trim().length > 0 && s.length <= 500),
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
