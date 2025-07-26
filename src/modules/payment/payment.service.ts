/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/payment/payment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { CreatePaymentRequest } from './dto/create-payment-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { InjectionRecord } from '../injection-record/entities/injection-record.entity';
import { getCurrentTimeInVietnam } from 'src/common/utils/date.util';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(InjectionRecord)
    private injectionRecordRepo: Repository<InjectionRecord>,
    private readonly transactionService: TransactionService,
  ) {}

  async createPayment(request: CreatePaymentRequest) {
    const transaction = await this.transactionService.create(
      request.studentId,
      request.parentId,
      request.injectionEventId,
    );
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || '';
    const orderInfo = 'Thanh toán cho tiêm chủng';
    const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    const redirectUrl = this.configService.get<string>('MOMO_RETURN_URL');
    const requestType = this.configService.get<string>('MOMO_REQUEST_TYPE');
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL');
    const requestId = new Date().toISOString();
    const extraData = `${transaction.id} ${request.studentId} ${request.injectionEventId}`;
    const autoCapture = true;
    const amount = transaction.injectionEvent.price;
    const lang = 'vi';
    const orderId = new Date().toISOString();
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
      partnerName: 'MedixCampus',
      storeId: 'siuuuu',
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
      return response.data.deeplink;
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

  async finishPayment(request: any) {
    const extraData = request.extraData.split(' ');
    const transaction = await this.transactionRepo.findOne({
      where: { id: extraData[0] },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    if (request.resultCode != 0) {
      transaction.status = TransactionStatus.CANCELLED;
    } else {
      transaction.status = TransactionStatus.PAID;
      const injectionRecord = this.injectionRecordRepo.create({
        student: { id: extraData[1] },
        injectionEvent: { id: extraData[2] },
        registrationDate: getCurrentTimeInVietnam(),
      });
      await this.injectionRecordRepo.save(injectionRecord);
    }

    await this.transactionRepo.save(transaction);
    return request.resultCode == 0;
  }
}
