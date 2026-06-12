import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard }        from '../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe }   from '../common/pipes/parse-object-id.pipe';
import { ActionItemsService }  from './action-items.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';

@ApiTags('action-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('action-items')
export class ActionItemsController {
  constructor(private readonly actionItemsService: ActionItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a follow-up action item' })
  create(@Body() dto: CreateActionItemDto) {
    return this.actionItemsService.create(dto);
  }

  @Get(':incidentId')
  @ApiOperation({ summary: 'List action items for an incident' })
  findByIncident(@Param('incidentId', ParseObjectIdPipe) incidentId: string) {
    return this.actionItemsService.findByIncident(incidentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an action item (e.g. mark Done)' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateActionItemDto,
  ) {
    return this.actionItemsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an action item' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.actionItemsService.remove(id);
  }
}
