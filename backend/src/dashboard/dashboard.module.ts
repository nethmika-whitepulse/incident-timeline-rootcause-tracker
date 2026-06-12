import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService }    from './dashboard.service';
import { Incident, IncidentSchema }   from '../incidents/schemas/incident.schema';
import { ActionItem, ActionItemSchema } from '../action-items/schemas/action-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name,   schema: IncidentSchema   },
      { name: ActionItem.name, schema: ActionItemSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers:   [DashboardService],
})
export class DashboardModule {}
