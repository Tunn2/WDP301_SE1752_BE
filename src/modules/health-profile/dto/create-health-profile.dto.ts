/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateHealthProfileDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 60 })
  @IsNotEmpty()
  weight: number;

  @ApiProperty({ example: 160 })
  @IsNotEmpty()
  height: number;

  @ApiProperty({ example: 'A' })
  @IsString()
  bloodType: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  vision: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  hearing: number;

  @ApiProperty({ example: 'Hải sản' })
  @IsString()
  allergies: string;

  @ApiProperty({ example: 'Hay đau bụng' })
  @IsString()
  note: string;
}
