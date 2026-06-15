import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard }           from '../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe }      from '../common/pipes/parse-object-id.pipe';
import { TimelineService }        from './timeline.service';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';
import { UpdateTimelineEventDto } from './dto/update-timeline-event.dto';

@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  @ApiOperation({ summary: 'Add a timeline event to an incident' })
  create(@Body() dto: CreateTimelineEventDto) {
    return this.timelineService.create(dto);
  }

  @Get(':incidentId')
  @ApiOperation({ summary: 'Get all timeline events for an incident (chronological)' })
  findByIncident(@Param('incidentId', ParseObjectIdPipe) incidentId: string) {
    return this.timelineService.findByIncident(incidentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a timeline event' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTimelineEventDto,
  ) {
    return this.timelineService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timeline event' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.timelineService.remove(id);
  }
}
