import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSlotMedicineDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Paracetamol' })
  name: string;

  @IsString()
  @IsEmpty()
  @ApiProperty({ example: 'Uống sau ăn' })
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 1 })
  quantity: number;
}

export class SlotRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Sáng' })
  session: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: [CreateSlotMedicineDto],
    description: 'Danh sách các thuốc uống trong buổi này',
  })
  medicines: CreateSlotMedicineDto[];
}

export class CreateMedicineRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '6' })
  studentId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Ghi chú' })
  note: string;

  @IsString()
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @IsNotEmpty()
  @ApiProperty({
    type: [SlotRequestDto],
    description: 'Danh sách các yêu cầu gửi thuốc theo từng buổi',
  })
  slots: SlotRequestDto[];
}
