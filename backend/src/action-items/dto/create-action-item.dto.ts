import { IsString, IsMongoId, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional }                       from '@nestjs/swagger';
import { ActionItemStatus }                                       from '../schemas/action-item.schema';

export class CreateActionItemDto {
  @ApiProperty() @IsMongoId()    incidentId: string;
  @ApiProperty() @IsString()     title:      string;
  @ApiProperty() @IsString()     owner:      string;
  @ApiProperty() @IsDateString() dueDate:    string;
  @ApiPropertyOptional({ enum: ActionItemStatus })
  @IsOptional() @IsEnum(ActionItemStatus)
  status?: ActionItemStatus;
}
