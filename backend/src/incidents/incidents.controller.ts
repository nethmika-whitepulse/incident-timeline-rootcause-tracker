import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard }        from '../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe }   from '../common/pipes/parse-object-id.pipe';
import { IncidentsService }    from './incidents.service';
import { CreateIncidentDto }   from './dto/create-incident.dto';
import { UpdateIncidentDto }   from './dto/update-incident.dto';
import { IncidentStatus, Severity } from './schemas/incident.schema';

@ApiTags('incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  create(@Body() dto: CreateIncidentDto, @Request() req) {
    return this.incidentsService.create(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all incidents — optionally filter by status and/or severity' })
  @ApiQuery({ name: 'status',   required: false, enum: IncidentStatus })
  @ApiQuery({ name: 'severity', required: false, enum: Severity })
  findAll(
    @Query('status')   status?: IncidentStatus,
    @Query('severity') severity?: Severity,
  ) {
    return this.incidentsService.findAll({ status, severity });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single incident by ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an incident' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an incident' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.incidentsService.remove(id);
  }
}
