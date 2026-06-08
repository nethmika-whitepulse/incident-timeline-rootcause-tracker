import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimelineEvent, TimelineEventDocument } from './schemas/timeline-event.schema';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';
import { UpdateTimelineEventDto } from './dto/update-timeline-event.dto';

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(TimelineEvent.name) private model: Model<TimelineEventDocument>,
  ) {}

  create(dto: CreateTimelineEventDto) {
    return this.model.create(dto);
  }

  findByIncident(incidentId: string) {
    return this.model.find({ incidentId }).sort({ timestamp: 1 }); // chronological
  }

  async update(id: string, dto: UpdateTimelineEventDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException(`Timeline event ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Timeline event ${id} not found`);
    return { message: 'Timeline event deleted' };
  }
}
