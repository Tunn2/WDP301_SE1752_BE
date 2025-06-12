/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectionEvent } from './entities/injection-event.entity';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  formatToBangkokTime,
  getCurrentTimeInBangkok,
} from 'src/common/utils/date.util';
import { CreateInjectionEventDto } from './dto/create-injection-event.dto';
import { Vaccination } from '../vaccination/entities/vaccine.entity';
import { Student } from '../student/entities/student.entity';
import { ParentStudent } from '../user/entities/parent-student.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { TransactionService } from '../transaction/transaction.service';
import { ExcelService } from '../excel/excel.service';
import * as XLSX from 'xlsx';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { StudentVaccination } from '../vaccination/entities/student-vaccination.entity';

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
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(StudentVaccination)
    private studentVaccinationRepo: Repository<StudentVaccination>,
    private mailerService: MailerService,
    private readonly transactionService: TransactionService,
    private readonly excelService: ExcelService,
  ) {}
  async create(request: CreateInjectionEventDto) {
    const foundVaccination = await this.vaccinationRepo.findOne({
      where: { id: request.vaccinationId },
    });

    if (!foundVaccination) throw new NotFoundException('Vaccination not found');

    await this.injectionEventRepo.save({
      vaccination: foundVaccination,
      date: formatToBangkokTime(request.date),
      registrationCloseDate: formatToBangkokTime(request.registrationCloseDate),
      price: request.price,
      registrationOpenDate: formatToBangkokTime(request.registrationOpenDate),
    });

    const studentsNotEnoughDoses = await this.studentRepo
      .createQueryBuilder('student')
      .leftJoin('student.studentVaccinations', 'studentVaccination')
      .where('studentVaccination.doses < :requiredDoses', {
        requiredDoses: foundVaccination.numberOfDoses,
      })
      .orWhere('studentVaccination.id IS NULL')
      .select('student.id', 'id')
      .getRawMany();
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
        subject: 'Sụ kiện tiêm chủng',
        template: 'new-injection-event',
        context: {
          date: formatToBangkokTime(request.date),
          vaccination: foundVaccination.name,
          registrationOpenDate: formatToBangkokTime(
            request.registrationOpenDate,
          ),
          registrationCloseDate: formatToBangkokTime(
            request.registrationCloseDate,
          ),
        },
      });
    });
    return;
  }

  async findAvailableInjectionEvents() {
    const injectionEvents = await this.injectionEventRepo.find({
      where: {
        registrationOpenDate: LessThanOrEqual(getCurrentTimeInBangkok()),
        registrationCloseDate: MoreThanOrEqual(getCurrentTimeInBangkok()),
      },
      relations: ['vaccination'],
    });
    return injectionEvents.map((injectionEvent) => ({
      ...injectionEvent,
      registrationCloseDate: formatToBangkokTime(
        injectionEvent.registrationCloseDate,
      ),
      registrationOpenDate: formatToBangkokTime(
        injectionEvent.registrationOpenDate,
      ),
      date: formatToBangkokTime(injectionEvent.date),
    }));
  }

  async findStudentRegisterdByInjectionEventId(injectionEventId: string) {
    const data =
      await this.transactionService.findStudentByInjectionEventId(
        injectionEventId,
      );
    return this.excelService.exportToExcel(data);
  }

  async markAttendance(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

    for (const row of rows) {
      const foundTransaction = await this.transactionRepo.findOne({
        where: { student: { id: row['id'] } },
        relations: ['student', 'injectionEvent', 'injectionEvent.vaccination'],
      });
      if (!foundTransaction)
        throw new NotFoundException('Transaction not found');
      if (row['Attendance'] == 'y') {
        foundTransaction.status = TransactionStatus.FINISHED;
        const studentVaccination = await this.studentVaccinationRepo.findOne({
          where: {
            student: { id: foundTransaction.student.id },
            vaccination: { id: foundTransaction.injectionEvent.vaccination.id },
          },
        });
        if (!studentVaccination) {
          await this.studentVaccinationRepo.save({
            student: { id: foundTransaction.student.id },
            doses: 1,
            vaccination: { id: foundTransaction.injectionEvent.vaccination.id },
          });
        } else {
          studentVaccination.doses += 1;
          await this.studentVaccinationRepo.save(studentVaccination);
        }
      } else {
        foundTransaction.status = TransactionStatus.NO_SHOW;
      }
      foundTransaction.condition = row['Condition'] || null;
      await this.transactionRepo.save(foundTransaction);
    }
  }

  async findStudentHaveInjectedByInjectionEventId(injectionEventId: string) {
    const transactions = await this.transactionRepo.find({
      where: {
        injectionEvent: { id: injectionEventId },
        status: TransactionStatus.FINISHED,
      },
      relations: ['student'],
    });
    const studentIds = transactions.map(
      (transaction) => transaction.student.id,
    );
    const students = await this.studentRepo.find({
      where: { id: In(studentIds) },
    });
    return students;
  }

  async findStudentNotInjectedByInjectionEventId(injectionEventId: string) {
    const transactions = await this.transactionRepo.find({
      where: {
        injectionEvent: { id: injectionEventId },
        status: In([TransactionStatus.PAID, TransactionStatus.NO_SHOW]),
      },
      relations: ['student'],
    });
    const studentIds = transactions.map(
      (transaction) => transaction.student.id,
    );
    const students = await this.studentRepo.find({
      where: { id: In(studentIds) },
    });
    return students;
  }
}
