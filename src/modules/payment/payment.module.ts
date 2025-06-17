import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TransactionModule } from '../transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { InjectionRecord } from '../injection-record/entities/injection-record.entity';

@Module({
  imports: [
    TransactionModule,
    TypeOrmModule.forFeature([Transaction, InjectionRecord]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
