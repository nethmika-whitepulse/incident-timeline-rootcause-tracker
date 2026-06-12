import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rca, RcaDocument } from './schemas/rca.schema';
import { CreateRcaDto }     from './dto/create-rca.dto';
import { UpdateRcaDto }     from './dto/update-rca.dto';

@Injectable()
export class RcaService {
  constructor(@InjectModel(Rca.name) private model: Model<RcaDocument>) {}

  create(dto: CreateRcaDto) {
    return this.model.create(dto);
  }

  async findByIncident(incidentId: string) {
    const rca = await this.model.findOne({ incidentId });
    if (!rca) throw new NotFoundException(`RCA for incident ${incidentId} not found`);
    return rca;
  }

  async update(incidentId: string, dto: UpdateRcaDto) {
    const updated = await this.model.findOneAndUpdate({ incidentId }, dto, { new: true });
    if (!updated) throw new NotFoundException(`RCA for incident ${incidentId} not found`);
    return updated;
  }
}
