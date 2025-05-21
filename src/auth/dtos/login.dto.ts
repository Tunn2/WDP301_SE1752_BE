import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '0123456789' })
  phone: string;
  @ApiProperty({ example: '12345' })
  password: string;
}
