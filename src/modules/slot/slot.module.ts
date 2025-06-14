import { Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import { UploadModule } from 'src/upload/upload.module';
import { S3Service } from '../s3/s3.service';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, Student, MedicineRequest, User]),
    UploadModule,
  ],
  controllers: [SlotController],
  providers: [SlotService, S3Service],
})
export class SlotModule {}
