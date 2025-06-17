import { Module } from '@nestjs/common';
import { InjectionRecordService } from './injection-record.service';
import { InjectionRecordController } from './injection-record.controller';

@Module({
  controllers: [InjectionRecordController],
  providers: [InjectionRecordService],
})
export class InjectionRecordModule {}
