import { Module } from '@nestjs/common';
import { InjectionEventService } from './injection-event.service';
import { InjectionEventController } from './injection-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectionEvent } from './entities/injection-event.entity';
import { Student } from '../student/entities/student.entity';
import { Vaccination } from '../vaccination/entities/vaccine.entity';
import { ParentStudent } from '../user/entities/parent-student.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { ExcelService } from '../excel/excel.service';
import { Transaction } from '../transaction/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InjectionEvent,
      Student,
      Vaccination,
      ParentStudent,
      Transaction,
    ]),
    TransactionModule,
  ],
  controllers: [InjectionEventController],
  providers: [InjectionEventService, ExcelService],
})
export class InjectionEventModule {}
