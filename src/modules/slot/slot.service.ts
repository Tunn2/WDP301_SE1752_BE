/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { Between, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Student } from 'src/modules/student/entities/student.entity';
import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  getEndOfTodayInBangkok,
  getStartOfTodayInBangkok,
} from 'src/common/utils/date.util';
import { UploadService } from 'src/upload/upload.service';
dayjs.extend(utc);
dayjs.extend(timezone);
@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot) private slotRepo: Repository<Slot>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(MedicineRequest)
    private medicineRequestRepo: Repository<MedicineRequest>,
    private uploadService: UploadService,
  ) {}

  async importFromExcel(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    const startOfToday = dayjs().tz('Asia/Bangkok').startOf('day').toDate();
    const endOfToday = dayjs().tz('Asia/Bangkok').endOf('day').toDate();
    await Promise.all(
      rows.map(async (row) => {
        const student = await this.studentRepo.findOne({
          where: { studentCode: row['MSHS'] },
        });

        if (!student)
          throw new NotFoundException(`Student not found: ${row['MSHS']}`);

        const medicineRequest = await this.medicineRequestRepo.findOne({
          where: { student, date: Between(startOfToday, endOfToday) },
        });

        if (!medicineRequest)
          throw new NotFoundException(
            `Medicine request not found for student: ${row['MSHS']}`,
          );
        for (const session of ['Sáng', 'Trưa', 'Chiều']) {
          if (row[session]) {
            const slot = this.slotRepo.create({
              medicineRequest,
              note: row[session],
              session,
              status: false,
              image: '',
            });
            await this.slotRepo.save(slot);
          }
        }
      }),
    );
  }

  async findToday(status: boolean, session: string, nurseId: string) {
    const slots = await this.slotRepo.find({
      where: {
        medicineRequest: {
          date: Between(getStartOfTodayInBangkok(), getEndOfTodayInBangkok()),
        },
        nurse: { id: nurseId },
        status: status,
        session,
      },
      relations: ['medicineRequest.student'],
    });

    //after getting slots, arrange them by class
    const arrangedSlots = slots.reduce(
      (acc, slot) => {
        const classroom = slot.medicineRequest.student.class;
        if (!acc[classroom]) {
          acc[classroom] = [];
        }
        acc[classroom].push(slot);
        return acc;
      },
      {} as Record<string, Slot[]>,
    );
    return arrangedSlots;
  }

  async checkSlot(id: string, image: Express.Multer.File) {
    const foundSlot = await this.slotRepo.findOne({ where: { id } });
    const uploadImage = await this.uploadService.uploadImageToS3(image);

    if (!foundSlot) throw new NotFoundException('Slot not found');

    if (foundSlot.status)
      throw new BadRequestException('This slot has been already checked');
    foundSlot.status = true;
    foundSlot.image = uploadImage.url;
    await this.slotRepo.save(foundSlot);
  }
}
