import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evidence, EvidenceDocument } from './schemas/evidence.schema';
import { CreateEvidenceDto }          from './dto/create-evidence.dto';

@Injectable()
export class EvidenceService {
  constructor(
    @InjectModel(Evidence.name) private model: Model<EvidenceDocument>,
  ) {}

  create(dto: CreateEvidenceDto, file?: Express.Multer.File) {
    return this.model.create({
      ...dto,
      filename: file?.originalname,
      filePath: file?.path,
    });
  }

  findByIncident(incidentId: string) {
    return this.model.find({ incidentId });
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Evidence ${id} not found`);
    return { message: 'Evidence deleted' };
  }
}
