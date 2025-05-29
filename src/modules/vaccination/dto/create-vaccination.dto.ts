import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateVaccinationDto {
  @IsString()
  @ApiProperty({ example: 'Viêm màng não mô cầu' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Viêm màng não mô cầu rất nguy hiểm' })
  description: string;

  @IsNumber()
  @ApiProperty({ example: 2 })
  numberOfDoses: number;
}
