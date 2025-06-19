import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SeverityLevel } from '../entities/post-injection-report.entity';

export class CreatePostInjectionReportDto {
  @ApiProperty({ example: '1' })
  injectionRecordId: string;

  @ApiProperty({ example: 'low' })
  @IsEnum(SeverityLevel)
  severity: SeverityLevel;

  @ApiProperty({ example: 'Con tôi có dấu hiệu bị khùng' })
  @IsString()
  description: string;

  @ApiProperty({ example: 39 })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 39 })
  @IsNumber()
  hoursPostInjection: number;
}
