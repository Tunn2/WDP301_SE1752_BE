import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateHealthEventDto {
  @IsString()
  @ApiProperty({ example: 'Khám sức khỏe đợt 1 2025' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Khám chill chill' })
  description: string;

  @ApiProperty({ example: new Date() }) // Cung cấp một ví dụ ngày hợp lệ
  date: Date;
}
