/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineRequest } from './entities/medicine-request.entity';
import { Between, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';
import {
  formatToBangkokTime,
  getCurrentTimeInBangkok,
  getEndOfTodayInBangkok,
  getStartOfTodayInBangkok,
} from 'src/common/utils/date.util';

@Injectable()
export class MedicineRequestService {
  constructor(
    @InjectRepository(MedicineRequest)
    private medicineRequestRepo: Repository<MedicineRequest>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
    private uploadService: UploadService,
  ) {}

  async create(
    file: Express.Multer.File,
    userId: string,
    request: CreateMedicineRequestDto,
  ) {
    const foundMedicineRequest = await this.medicineRequestRepo.findOne({
      where: {
        student: { id: request.studentId },
        date: Between(getStartOfTodayInBangkok(), getEndOfTodayInBangkok()),
      },
    });

    if (foundMedicineRequest)
      throw new BadRequestException(
        'This student already had a medicine request today',
      );

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const checkValid = await this.parentStudentRepo.findOne({
      where: { student: { id: request.studentId }, user: { id: userId } },
    });

    if (!checkValid) {
      throw new BadRequestException('This user is not parent of this student');
    }
    const uploadResult = await this.uploadService.uploadImage(file);
    const imageUrl = uploadResult.url;
    const medicineRequest = this.medicineRequestRepo.create({
      image: imageUrl,
      student: { id: request.studentId },
      parent: { id: userId },
      note: request.note,
      date: getCurrentTimeInBangkok(),
    });
    await this.medicineRequestRepo.save(medicineRequest);
  }

  async getMedicineRequestToday() {
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInBangkok(), getEndOfTodayInBangkok()),
      },
      relations: ['student', 'parent'],
    });

    return medicineRequests.map((req) => ({
      ...req,
      date: formatToBangkokTime(req.date),
    }));
  }

  async findByParent(parentId: string) {
    const medicineRequests = await this.medicineRequestRepo.find({
      where: { parent: { id: parentId } },
      relations: ['parent', 'student'],
      order: { date: 'DESC' },
    });
    return medicineRequests.map((req) => ({
      ...req,
      date: formatToBangkokTime(req.date),
    }));
  }
}
