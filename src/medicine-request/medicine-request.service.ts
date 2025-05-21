/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineRequest } from './entities/medicine-request.entity';
import { Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';

@Injectable()
export class MedicineRequestService {
  constructor(
    @InjectRepository(MedicineRequest)
    private medicineRequestRepo: Repository<MedicineRequest>,
    private uploadService: UploadService,
  ) {}

  async create(
    file: Express.Multer.File,
    userId: string,
    request: CreateMedicineRequestDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const uploadResult = await this.uploadService.uploadImage(file);
    const imageUrl = uploadResult.url;
    const medicineRequest = this.medicineRequestRepo.create({
      image: imageUrl,
      student: { id: request.studentId },
      parent: { id: userId },
      note: request.note,
    });
    await this.medicineRequestRepo.save(medicineRequest);
  }
}
