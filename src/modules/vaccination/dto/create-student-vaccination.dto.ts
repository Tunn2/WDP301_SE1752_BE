import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateStudentVaccinationDto {
  @IsString()
  @ApiProperty({ example: '6' })
  studentId: string;

  @IsString()
  @ApiProperty({ example: '1' })
  vaccinationId: string;

  @IsNumber()
  @ApiProperty({ example: 3 })
  doses: number;
}
