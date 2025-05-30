import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { InjectionEvent } from '../injection-event/entities/injection-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Student, InjectionEvent]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
