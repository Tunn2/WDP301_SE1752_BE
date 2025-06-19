import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @ApiProperty({ example: '27-06-2025 12:00:00' })
  appointmentTime: Date;

  @IsString()
  @ApiProperty({ example: 'Khám chill chill' })
  purpose: string;

  @IsString()
  @ApiProperty({ example: '9' })
  parentId: string;

  @IsNumber()
  @ApiProperty({ example: 45 })
  duration: number;
}
