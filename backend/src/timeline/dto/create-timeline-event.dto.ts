import { IsString, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimelineEventDto {
  @ApiProperty() @IsMongoId()  incidentId:  string;
  @ApiProperty() @IsDateString() timestamp: string;
  @ApiProperty() @IsString()  description:  string;
  @ApiProperty() @IsString()  author:       string;
}
