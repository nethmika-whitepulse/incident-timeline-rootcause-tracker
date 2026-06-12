import { IsString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional }         from '@nestjs/swagger';
import { EvidenceType }                             from '../schemas/evidence.schema';

export class CreateEvidenceDto {
  @ApiProperty() @IsMongoId()         incidentId:  string;
  @ApiProperty({ enum: EvidenceType }) @IsEnum(EvidenceType) type: EvidenceType;
  @ApiPropertyOptional() @IsOptional() @IsString() notes:      string;
  @ApiProperty() @IsString()          uploadedBy:  string;
}
