import { Controller } from '@nestjs/common';
import { InjectionRecordService } from './injection-record.service';

@Controller('injection-record')
export class InjectionRecordController {
  constructor(
    private readonly injectionRecordService: InjectionRecordService,
  ) {}
}
