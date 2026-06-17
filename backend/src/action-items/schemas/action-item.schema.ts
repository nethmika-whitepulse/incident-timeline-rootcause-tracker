import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types }     from 'mongoose';

export type ActionItemDocument = HydratedDocument<ActionItem>;

export enum ActionItemStatus { Open = 'Open', InProgress = 'In Progress', Done = 'Done' }

@Schema({ timestamps: true })
export class ActionItem {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Incident' })
  incidentId: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 200 })
  title: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  owner: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true, enum: ActionItemStatus, default: ActionItemStatus.Open })
  status: ActionItemStatus;
}

export const ActionItemSchema = SchemaFactory.createForClass(ActionItem);

// Compound indexes
ActionItemSchema.index({ incidentId: 1, status: 1 }); // fetch open/done items per incident
ActionItemSchema.index({ dueDate: 1 });                // sort/filter overdue items
