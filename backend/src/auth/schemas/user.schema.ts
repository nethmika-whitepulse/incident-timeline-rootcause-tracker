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

  // Hash of the current refresh token (bcrypt), not the raw token itself —
  // same reasoning as the password hash. select: false so it's never
  // returned by default queries either. Cleared on logout, replaced on every
  // refresh (rotation), so a stolen refresh token only works once before the
  // legitimate user's next refresh invalidates it.
  @Prop({ select: false })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
