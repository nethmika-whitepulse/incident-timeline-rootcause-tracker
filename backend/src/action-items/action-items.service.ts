import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionItem, ActionItemDocument } from './schemas/action-item.schema';
import { CreateActionItemDto }            from './dto/create-action-item.dto';
import { UpdateActionItemDto }            from './dto/update-action-item.dto';

@Injectable()
export class ActionItemsService {
  constructor(@InjectModel(ActionItem.name) private model: Model<ActionItemDocument>) {}

  create(dto: CreateActionItemDto)    { return this.model.create(dto); }
  findByIncident(incidentId: string)  { return this.model.find({ incidentId }); }

  async update(id: string, dto: UpdateActionItemDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException(`Action item ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Action item ${id} not found`);
    return { message: 'Action item deleted' };
  }
}
