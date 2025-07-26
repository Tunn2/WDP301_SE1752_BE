import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AccidentStatus } from 'src/common/enums/accident-status.enum';

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

  @IsString()
  @ApiProperty({ example: AccidentStatus.MEDICAL_ROOM })
  status: AccidentStatus;
}
