import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional }            from '@nestjs/swagger';
import { Severity, IncidentStatus }                    from '../schemas/incident.schema';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Database connection pool exhausted' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Primary DB unreachable from all app servers' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: Severity, example: Severity.P1 })
  @IsEnum(Severity)
  severity: Severity;

  @ApiPropertyOptional({ enum: IncidentStatus })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ example: '2024-06-01T09:10:00.000Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ example: '2024-06-01T11:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
