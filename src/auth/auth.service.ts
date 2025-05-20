/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.userService.findByPhone(phone);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  login(user: any) {
    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
