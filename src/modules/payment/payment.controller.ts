/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentRequest } from './dto/create-payment-request.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('momo/create')
  async createPayment(@Body() createPaymentRequest: CreatePaymentRequest) {
    const result =
      await this.paymentService.createPayment(createPaymentRequest);
    return new ResponseDTO(201, true, 'Create payment successfully', result);
  }

  @Post('momo/notify')
  async handleNotify(@Body() body: any) {
    const isSuccess = await this.paymentService.finishPayment(body);
    if (isSuccess) return new ResponseDTO(200, true, 'Pay successfully', null);
    return new ResponseDTO(400, false, 'Pay failed', null);
  }
}
