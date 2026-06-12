import {
  Controller, Get, Post, Delete,
  Body, Param, UploadedFile, UseInterceptors, UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard }        from '../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe }   from '../common/pipes/parse-object-id.pipe';
import { EvidenceService }     from './evidence.service';
import { CreateEvidenceDto }   from './dto/create-evidence.dto';

// Allowed mime types for evidence uploads
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain',
  'application/pdf',
];

@ApiTags('evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @ApiOperation({ summary: 'Upload evidence (screenshot, log, or note)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      // fileFilter rejects disallowed mime types before they are saved to disk
      fileFilter: (_req, file, cb) => {
        if (!file || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File type "${file.mimetype}" is not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  create(
    @Body() dto: CreateEvidenceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.evidenceService.create(dto, file);
  }

  @Get(':incidentId')
  @ApiOperation({ summary: 'List all evidence for an incident' })
  findByIncident(@Param('incidentId', ParseObjectIdPipe) incidentId: string) {
    return this.evidenceService.findByIncident(incidentId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an evidence item' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.evidenceService.remove(id);
  }
}
