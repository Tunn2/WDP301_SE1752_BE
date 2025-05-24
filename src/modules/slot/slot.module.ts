import { Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Student, MedicineRequest])],
  controllers: [SlotController],
  providers: [SlotService],
})
export class SlotModule {}
