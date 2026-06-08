import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard }       from '../common/guards/jwt-auth.guard';
import { IncidentsService }   from './incidents.service';
import { CreateIncidentDto }  from './dto/create-incident.dto';
import { UpdateIncidentDto }  from './dto/update-incident.dto';

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
  @ApiOperation({ summary: 'List all incidents' })
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single incident' })
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an incident' })
  update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an incident' })
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
