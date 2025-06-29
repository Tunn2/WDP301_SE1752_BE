import { ApiProperty } from '@nestjs/swagger';

export class ChangeAppointmentTimeDto {
  @ApiProperty({ example: '27-07-2025 12:00:00' })
  newAppointmentTime: Date;
}
