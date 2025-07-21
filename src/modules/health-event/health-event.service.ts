/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HealthEvent } from './entities/health-event.entity';
import { Repository } from 'typeorm';
import { CreateHealthEventDto } from './dto/create-health-event.dto';
import {
  formatToVietnamTime,
  getCurrentTimeInVietnam,
} from 'src/common/utils/date.util';
import * as XLSX from 'xlsx';
import { Student } from '../student/entities/student.entity';
import { HealthProfile } from '../health-profile/entities/health-profile.entity';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { HealthEventStudent } from './entities/health-event-student.entity';
@Injectable()
export class HealthEventService {
  constructor(
    @InjectRepository(HealthEvent)
    private healthEventRepo: Repository<HealthEvent>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(HealthProfile)
    private healthProfileRepo: Repository<HealthProfile>,
    private readonly healthProfileService: HealthProfileService,
    @InjectRepository(HealthEventStudent)
    private healthEventStudentRepo: Repository<HealthEventStudent>,
  ) {}

  async create(request: CreateHealthEventDto) {
    await this.healthEventRepo.save({
      ...request,
      date: formatToVietnamTime(request.date),
    });
  }

  async findAll() {
    const healthEvents = await this.healthEventRepo.find({
      order: { date: 'DESC' },
    });
    return healthEvents.map((event) => ({
      ...event,
      date: formatToVietnamTime(event.date),
    }));
  }

  async importResultFromExcel(fileBuffer: Buffer, nurseId: string) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    await Promise.all(
      rows.map(async (row) => {
        const student = await this.studentRepo.findOne({
          where: { studentCode: row['MSHS'] },
        });

        if (!student)
          throw new NotFoundException(`Student not found: ${row['MSHS']}`);

        const latestHealthProfile =
          await this.healthProfileService.findLatestByStudentId(student.id);
        let newHealthProfile: HealthProfile | null = null;
        if (latestHealthProfile == null) {
          newHealthProfile = this.healthProfileRepo.create({
            allergies: '',
            bloodType: '',
            note: '',
            student,
            user: { id: nurseId },
            date: getCurrentTimeInVietnam(),
            weight: row['Cân nặng'],
            height: row['Chiều cao'],
            hearing: row['Thính lực'],
            vision: row['Thị lực'],
          });
        } else {
          newHealthProfile = this.healthProfileRepo.create({
            allergies: latestHealthProfile?.allergies,
            bloodType: latestHealthProfile?.bloodType,
            note: latestHealthProfile?.note,
            student: latestHealthProfile?.student,
            user: { id: nurseId },
            date: getCurrentTimeInVietnam(),
            weight: row['Cân nặng'],
            height: row['Chiều cao'],
            hearing: row['Thính lực'],
            vision: row['Thị lực'],
          });
        }
        await this.healthProfileRepo.save(newHealthProfile);

        try {
          const healthEvents = await this.healthEventRepo.find({
            order: { date: 'DESC' },
            take: 1,
          });

          const healthEvent = healthEvents[0];

          if (!healthEvent) {
            throw new NotFoundException('No health event found');
          }

          await this.healthEventStudentRepo.save({
            student,
            healthEvent,
            healthProfile: newHealthProfile,
          });
        } catch (error) {
          console.error('Error fetching health event:', error.message);
        }
      }),
    );
  }
}
