import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineRequest } from './entities/medicine-request.entity';
import { Between, In, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';
import {
  formatToVietnamTime,
  getCurrentTimeInVietnam,
  getEndOfTodayInVietnam,
  getStartOfTodayInVietnam,
} from 'src/common/utils/date.util';
import { Slot } from '../slot/entities/slot.entity';

@Injectable()
export class MedicineRequestService {
  constructor(
    @InjectRepository(MedicineRequest)
    private medicineRequestRepo: Repository<MedicineRequest>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
    private uploadService: UploadService,
  ) {}

  async findAll() {
    return this.medicineRequestRepo.find({
      relations: ['student', 'parent'],
      order: { date: 'DESC' },
    });
  }

  async findById(id: string) {
    return this.medicineRequestRepo.findOne({
      where: { id },
      relations: ['student', 'parent', 'slots'],
    });
  }

  async approveMedicineRequest(id: string) {
    const medicineRequest = await this.medicineRequestRepo.findOne({
      where: { id },
    });

    if (!medicineRequest) {
      throw new BadRequestException('Medicine request not found');
    }
    medicineRequest.isApproved = true;
    await this.medicineRequestRepo.save(medicineRequest);
  }

  async create(
    file: Express.Multer.File,
    userId: string,
    request: CreateMedicineRequestDto,
  ) {
    const foundMedicineRequest = await this.medicineRequestRepo.findOne({
      where: {
        student: { id: request.studentId },
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
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
    // const uploadResult = await this.uploadService.uploadImage(file);
    const uploadResult = await this.uploadService.uploadImageToS3(file);
    const imageUrl = uploadResult.url;
    const medicineRequest = this.medicineRequestRepo.create({
      image: imageUrl,
      student: { id: request.studentId },
      parent: { id: userId },
      note: request.note,
      date: getCurrentTimeInVietnam(),
    });
    await this.medicineRequestRepo.save(medicineRequest);
  }

  async getMedicineRequestToday() {
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
      },
      relations: ['student', 'parent'],
    });

    return medicineRequests.map((req) => ({
      ...req,
      date: formatToVietnamTime(req.date),
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

  async getClassesToday() {
    // Lấy tất cả medicine requests hôm nay
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
      },
      relations: ['student', 'slots', 'slots.nurse'],
    });

    if (medicineRequests.length === 0) {
      throw new BadRequestException('No medicine requests found for today');
    }

    // Lọc ra những medicine requests chưa có nurse được assign
    const unassignedMedicineRequests = medicineRequests.filter((req) => {
      // Kiểm tra xem có slot nào chưa được assign nurse không
      return req.slots.some((slot) => !slot.nurse || !slot.nurse.id);
    });

    if (unassignedMedicineRequests.length === 0) {
      return []; // Hoặc throw exception nếu muốn
    }

    // Lấy danh sách các class chưa được assign
    const unassignedClasses = unassignedMedicineRequests.map(
      (req) => req.student.class,
    );

    // Loại bỏ duplicate classes
    return [...new Set(unassignedClasses)];
  }

  async assignNurseToClass(classes: string[], nurseId: string) {
    // Validation đầu vào
    if (!classes || classes.length === 0) {
      throw new BadRequestException('No classes provided');
    }
    if (!nurseId) {
      throw new BadRequestException('Nurse ID is required');
    }
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
        student: { class: In(classes) },
      },
      relations: ['student', 'slots', 'slots.nurse'],
    });

    if (medicineRequests.length === 0) {
      throw new BadRequestException(
        'No medicine requests found for the provided classes today',
      );
    }
    const unassignedSlots: Slot[] = [];
    medicineRequests.forEach((req) => {
      req.slots.forEach((slot) => {
        if (!slot.nurse || !slot.nurse.id) {
          unassignedSlots.push(slot);
        }
      });
    });

    if (unassignedSlots.length === 0) {
      throw new BadRequestException(
        'All slots for the provided classes are already assigned',
      );
    }

    return await this.medicineRequestRepo.manager.transaction(
      async (manager) => {
        const slotRepo = manager.getRepository(Slot);
        const updatePromises = unassignedSlots.map((slot) =>
          slotRepo.save({
            ...slot,
            nurse: { id: nurseId },
          }),
        );
        await Promise.all(updatePromises);
        return {
          message: `Successfully assigned nurse to ${unassignedSlots.length} slots across ${classes.length} classes`,
          assignedSlots: unassignedSlots.length,
          classes: classes,
        };
      },
    );
  }
}
