import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicineRequestDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsString()
  @IsOptional()
  note: string;
}
