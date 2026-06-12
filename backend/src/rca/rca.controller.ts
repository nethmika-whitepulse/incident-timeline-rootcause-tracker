import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RcaService }   from './rca.service';
import { CreateRcaDto } from './dto/create-rca.dto';
import { UpdateRcaDto } from './dto/update-rca.dto';

@ApiTags('rca')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rca')
export class RcaController {
  constructor(private readonly rcaService: RcaService) {}

  @Post()
  @ApiOperation({ summary: 'Create an RCA document for an incident' })
  create(@Body() dto: CreateRcaDto) {
    return this.rcaService.create(dto);
  }

  @Get(':incidentId')
  @ApiOperation({ summary: 'Get RCA for an incident' })
  findByIncident(@Param('incidentId') incidentId: string) {
    return this.rcaService.findByIncident(incidentId);
  }

  @Patch(':incidentId')
  @ApiOperation({ summary: 'Update RCA for an incident' })
  update(@Param('incidentId') incidentId: string, @Body() dto: UpdateRcaDto) {
    return this.rcaService.update(incidentId, dto);
  }
}
