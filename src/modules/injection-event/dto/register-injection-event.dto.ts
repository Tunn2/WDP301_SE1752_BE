import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterInjectionEvent {
  @IsString()
  @ApiProperty({ example: '6' })
  studentId: string;

  @IsString()
  @ApiProperty({ example: '44' })
  injectionEventId: string;
}
