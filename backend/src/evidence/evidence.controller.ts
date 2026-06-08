import {
  Controller, Get, Post, Delete,
  Body, Param, UploadedFile, UseInterceptors, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard }      from '../common/guards/jwt-auth.guard';
import { EvidenceService }   from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

@ApiTags('evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({ summary: 'Upload evidence (file + metadata)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() dto: CreateEvidenceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.evidenceService.create(dto, file);
  }

  @Get(':incidentId')
  @ApiOperation({ summary: 'List all evidence for an incident' })
  findByIncident(@Param('incidentId') incidentId: string) {
    return this.evidenceService.findByIncident(incidentId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an evidence item' })
  remove(@Param('id') id: string) {
    return this.evidenceService.remove(id);
  }
}
