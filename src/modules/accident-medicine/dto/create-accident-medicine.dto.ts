import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export class MedicineDto {
  @IsString()
  @ApiProperty({ example: '1' })
  medicineId: string;

  @IsNumber()
  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CreateAccidentMedicineDto {
  @IsString()
  @ApiProperty({ example: '1' })
  accidentId: string;

  @ValidateNested({ each: true })
  @Type(() => MedicineDto)
  @ApiProperty({
    type: [MedicineDto],
    example: [
      { medicineId: 'a', quantity: 2 },
      { medicineId: 'b', quantity: 3 },
    ],
  })
  medicines: MedicineDto[];
}
