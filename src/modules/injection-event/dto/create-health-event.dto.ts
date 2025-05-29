import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateInjectionEventDto {
  @IsString()
  @ApiProperty({ example: '1' })
  vaccinationId: string;

  @ApiProperty({ example: new Date() })
  date: Date;
}
