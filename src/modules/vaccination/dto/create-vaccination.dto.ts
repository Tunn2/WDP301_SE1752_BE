import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { VaccinationType } from 'src/common/enums/vaccination-type.enum';

export class CreateVaccinationDto {
  @IsString()
  @ApiProperty({ example: 'Viêm màng não mô cầu' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Viêm màng não mô cầu rất nguy hiểm' })
  description: string;

  @IsString()
  @ApiProperty({ example: 'free' })
  type: VaccinationType;

  @IsNumber()
  @ApiProperty({ example: 2 })
  numberOfDoses: number;
}
