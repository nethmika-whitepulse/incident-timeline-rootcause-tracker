import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  // match validates the email format at the Mongoose layer — catches values
  // like "notanemail" that pass class-validator's @IsEmail but could slip
  // through if the model is ever used outside the validated controller path.
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Value must be a valid email address'],
  })
  email: string;

  // select: false — hash never returned by default queries.
  // Login must explicitly opt-in with .select('+password').
  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
