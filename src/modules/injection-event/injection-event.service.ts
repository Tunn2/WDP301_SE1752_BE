/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectionEvent } from './entities/injection-event.entity';
import { In, Repository } from 'typeorm';
import { formatToBangkokTime } from 'src/common/utils/date.util';
import { CreateInjectionEventDto } from './dto/create-injection-event.dto';
import { Vaccination } from '../vaccination/entities/vaccine.entity';
import { Student } from '../student/entities/student.entity';
import { ParentStudent } from '../user/entities/parent-student.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterInjectionEvent } from './dto/register-injection-event.dto';
import { StudentInjectionEvent } from '../student-injection/entities/student-injection-event.entity';

@Injectable()
export class InjectionEventService {
  constructor(
    @InjectRepository(InjectionEvent)
    private injectionEventRepo: Repository<InjectionEvent>,
    @InjectRepository(Vaccination)
    private vaccinationRepo: Repository<Vaccination>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
    private mailerService: MailerService,
    @InjectRepository(StudentInjectionEvent)
    private studentInjectionEventRepo: Repository<StudentInjectionEvent>,
  ) {}
  async create(request: CreateInjectionEventDto) {
    const foundVaccination = await this.vaccinationRepo.findOne({
      where: { id: request.vaccinationId },
    });

    if (!foundVaccination) throw new NotFoundException('Vaccination not found');

    await this.injectionEventRepo.save({
      vaccination: foundVaccination,
      date: formatToBangkokTime(request.date),
    });

    const studentsNotEnoughDoses = await this.studentRepo
      .createQueryBuilder('student')
      .leftJoin('student.studentVaccinations', 'studentVaccination')
      .where('studentVaccination.doses < :requiredDoses', {
        requiredDoses: foundVaccination.numberOfDoses,
      })
      .orWhere('studentVaccination.id IS NULL')
      .select('student.id', 'id') // Select only the `id` field and alias it as `id`
      .getRawMany(); // Retrieve raw data

    const studentsJson = studentsNotEnoughDoses.map((record) => record.id);

    const parentStudents = await this.parentStudentRepo.find({
      where: { student: { id: In(studentsJson) } },
      relations: ['user'],
    });
    const emailSet = new Set<string>();

    parentStudents.forEach((parentStudent) => {
      emailSet.add(parentStudent.user.email);
    });
    Array.from(emailSet).forEach((email) => {
      this.mailerService.sendMail({
        to: email,
        subject: 'New Injection Event',
        template: 'new-injection-event',
        context: {
          date: formatToBangkokTime(request.date),
          vaccination: foundVaccination.name,
        },
      });
    });
    return;
  }

  async register(request: RegisterInjectionEvent) {
    const foundInjectionEvent = await this.injectionEventRepo.findOne({
      where: { id: request.injectionEventId },
    });

    if (!foundInjectionEvent) {
      throw new Error('Injection event not found');
    }

    const currentDate = new Date();
    if (currentDate < foundInjectionEvent.registrationOpenDate) {
      throw new Error('Registration has not yet opened');
    }

    if (currentDate > foundInjectionEvent.registrationCloseDate) {
      throw new Error('Registration has already closed');
    }

    const foundStudentInjectionEvent =
      await this.studentInjectionEventRepo.findOne({
        where: {
          student: { id: request.studentId },
          injectionEvent: { id: request.injectionEventId },
        },
      });
  }
}
