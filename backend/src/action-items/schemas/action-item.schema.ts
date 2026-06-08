import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type ActionItemDocument = HydratedDocument<ActionItem>;

export enum ActionItemStatus { Open = 'Open', InProgress = 'In Progress', Done = 'Done' }

@Schema({ timestamps: true })
export class ActionItem {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true, enum: ActionItemStatus, default: ActionItemStatus.Open })
  status: ActionItemStatus;
}

export const ActionItemSchema = SchemaFactory.createForClass(ActionItem);
