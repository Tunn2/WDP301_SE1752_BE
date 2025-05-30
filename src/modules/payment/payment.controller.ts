/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/payment/payment.controller.ts
import { Controller, Post, Body, Res, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('momo/create')
  async createPayment(
    @Body('orderId') orderId: string = new Date().toISOString(),
    @Body('amount') amount: number = 50000000,
    @Res() res: Response,
  ) {
    try {
      const result = await this.paymentService.createPayment(orderId, amount);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Get('momo/return')
  async handleReturn(@Query() query: any, @Res() res: Response) {
    // Xử lý kết quả trả về từ MoMo (redirect URL)
    console.log('Return from MoMo:', query);
    return res.json(query);
  }

  @Post('momo/notify')
  async handleNotify(@Body() body: any, @Res() res: Response) {
    console.log('Notify from MoMo:', body);
    return res.status(200).json({ message: 'Received notification' });
  }
}
