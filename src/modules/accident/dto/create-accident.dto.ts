import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAccidentDto {
  @IsString()
  @ApiProperty({ example: 'SE111111' })
  studentCode: string;

  @IsString()
  @ApiProperty({ example: 'chảy máu đầu' })
  summary: string;

  @IsString()
  @ApiProperty({ example: 'Chấn thương' })
  type: string;
}
