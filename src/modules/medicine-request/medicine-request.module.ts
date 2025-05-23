import { Module } from '@nestjs/common';
import { MedicineRequestService } from './medicine-request.service';
import { MedicineRequestController } from './medicine-request.controller';
import { UploadModule } from 'src/upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineRequest } from './entities/medicine-request.entity';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';

@Module({
  imports: [
    UploadModule,
    TypeOrmModule.forFeature([MedicineRequest, ParentStudent]),
  ],
  controllers: [MedicineRequestController],
  providers: [MedicineRequestService],
})
export class MedicineRequestModule {}
