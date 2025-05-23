/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineRequest } from './entities/medicine-request.entity';
import { Between, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { ParentStudent } from 'src/user/entities/parent-student.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

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
      date: dayjs().tz('Asia/Bangkok').toDate(),
    });
    await this.medicineRequestRepo.save(medicineRequest);
  }

  async getMedicineRequestToday() {
    const startOfToday = dayjs().tz('Asia/Bangkok').startOf('day').toDate(); // 00:00 UTC+7
    const endOfToday = dayjs().tz('Asia/Bangkok').endOf('day').toDate(); // 23:59:59.999 UTC+7

    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(startOfToday, endOfToday),
      },
      relations: ['student', 'parent'],
    });

    // Chuyển đổi date sang UTC+7 dạng ISO string hoặc custom format
    return medicineRequests.map((req) => ({
      ...req,
      date: dayjs(req.date).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
    }));
  }

  async findByParent(parentId: string) {
    const medicineRequests = await this.medicineRequestRepo.find({
      where: { parent: { id: parentId } },
      order: { date: 'DESC' },
    });
    return medicineRequests.map((req) => ({
      ...req,
      date: dayjs(req.date).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
    }));
  }
}
