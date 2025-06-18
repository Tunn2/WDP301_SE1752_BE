import { ApiProperty } from '@nestjs/swagger';
import { HealthStatus } from '../entities/injection-record.entity';

export class UpdateRecordDto {
  @ApiProperty({ example: 'mild_reaction' })
  healthStatus: HealthStatus;
  @ApiProperty({ example: 39 })
  postInjectionTemperature: number;
  @ApiProperty({ example: 'Tự nhiên thấy nhức nhức cái đầu' })
  sideEffects: string;
  @ApiProperty({ example: '10h37' })
  notes: string;
}
