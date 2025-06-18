import { Module } from '@nestjs/common';
import { InjectionRecordService } from './injection-record.service';
import { InjectionRecordController } from './injection-record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { InjectionRecord } from './entities/injection-record.entity';
import { ExcelService } from '../excel/excel.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, InjectionRecord])],
  controllers: [InjectionRecordController],
  providers: [InjectionRecordService, ExcelService],
})
export class InjectionRecordModule {}
