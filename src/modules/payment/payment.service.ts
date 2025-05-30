/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  async createPayment(orderId: string, amount: number) {
    // Hard-coded giá trị để test
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || '';
    const orderInfo = 'pay with MoMo';
    const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    const redirectUrl = this.configService.get<string>('MOMO_RETURN_URL');
    const requestType = this.configService.get<string>('MOMO_REQUEST_TYPE'); // Loại yêu cầu thanh toán
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL');
    const requestId = orderId;
    const extraData = '';
    const autoCapture = true;
    const lang = 'vi';
    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    // Tạo chữ ký (signature) bằng HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Tạo body cho request gửi đến MoMo
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType, // Thêm requestType vào body
      autoCapture: autoCapture,
      extraData: extraData,
      signature: signature,
    });

    // Endpoint của MoMo để tạo thanh toán (thay thế bằng endpoint thực tế)
    const endpoint = this.configService.get<string>('MOMO_API_URL') || ''; // Hoặc lấy từ configService

    try {
      // Gửi yêu cầu POST đến MoMo API
      const response = await axios.post(endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Trả về dữ liệu phản hồi từ MoMo (thường là URL để chuyển hướng đến trang thanh toán)
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error(
        'Error creating MoMo payment:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}
