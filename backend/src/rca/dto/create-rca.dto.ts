import { IsString, IsMongoId, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional }          from '@nestjs/swagger';

export class CreateRcaDto {
  @ApiProperty() @IsMongoId()  incidentId:         string;
  @ApiProperty() @IsString()   rootCause:          string;
  @ApiProperty() @IsString()   resolution:         string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true })
  contributingFactors?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() lessonsLearned?: string;
}
