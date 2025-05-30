import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentRequest {
  @IsString()
  @ApiProperty({ example: '1' })
  parentId: string;

  @IsString()
  @ApiProperty({ example: '1' })
  studentId: string;

  @IsString()
  @ApiProperty({ example: '1' })
  injectionEventId: string;
}
