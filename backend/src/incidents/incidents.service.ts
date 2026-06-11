import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model }       from 'mongoose';
import { Incident, IncidentDocument, IncidentStatus, Severity } from './schemas/incident.schema';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

export interface IncidentFilter {
  status?:   IncidentStatus;
  severity?: Severity;
}

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private incidentModel: Model<IncidentDocument>,
  ) {}

  create(dto: CreateIncidentDto, userId: string) {
    return this.incidentModel.create({ ...dto, createdBy: userId });
  }

  findAll(filter: IncidentFilter = {}) {
    // Build query — only add fields that were actually passed
    const query: Record<string, any> = {};
    if (filter.status)   query.status   = filter.status;
    if (filter.severity) query.severity = filter.severity;

    return this.incidentModel
      .find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const incident = await this.incidentModel
      .findById(id)
      .populate('createdBy', 'name email');
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    const updated = await this.incidentModel
      .findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException(`Incident ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.incidentModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Incident ${id} not found`);
    return { message: 'Incident deleted' };
  }
}
