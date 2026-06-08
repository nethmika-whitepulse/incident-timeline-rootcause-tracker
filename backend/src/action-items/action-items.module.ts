import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionItemsController } from './action-items.controller';
import { ActionItemsService }    from './action-items.service';
import { ActionItem, ActionItemSchema } from './schemas/action-item.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ActionItem.name, schema: ActionItemSchema }])],
  controllers: [ActionItemsController],
  providers:   [ActionItemsService],
})
export class ActionItemsModule {}
