import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { Student } from '../student/entities/student.entity';
import { InjectionEvent } from '../injection-event/entities/injection-event.entity';
import { User } from '../user/entities/user.entity';
import { getCurrentTimeInBangkok } from 'src/common/utils/date.util';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';
import { StudentVaccination } from '../vaccination/entities/student-vaccination.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(InjectionEvent)
    private injectionEventRepo: Repository<InjectionEvent>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(StudentVaccination)
    private studentVaccinationRepo: Repository<StudentVaccination>,
  ) {}
  async create(
    studentId: string,
    parentId: string,
    injectionEventId: string,
  ): Promise<Transaction> {
    await this.checkExistTransaction(studentId, injectionEventId);
    const foundParent = await this.userRepo.findOne({
      where: { id: parentId },
    });
    const foundStudent = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    const foundInjectionEvent = await this.injectionEventRepo.findOne({
      where: { id: injectionEventId },
      relations: ['vaccination'],
    });

    if (!foundStudent || !foundParent || !foundInjectionEvent)
      throw new NotFoundException(
        'Student or parent or injection event not found',
      );
    await this.checkValidRegistration(
      studentId,
      foundInjectionEvent.vaccination.id,
      foundInjectionEvent.vaccination.numberOfDoses,
    );
    let transaction = this.transactionRepo.create({
      parent: foundParent,
      student: foundStudent,
      injectionEvent: foundInjectionEvent,
      registrationDate: getCurrentTimeInBangkok(),
    });

    transaction = await this.transactionRepo.save(transaction);

    const fullTransaction = await this.transactionRepo.findOne({
      where: { id: transaction.id },
      relations: ['parent', 'student', 'injectionEvent'], // Load các quan hệ
    });

    if (!fullTransaction) {
      throw new InternalServerErrorException('Failed to retrieve transaction');
    }

    return fullTransaction;
  }

  async findInjectionEventHistoryByStudentId(studentId: string) {
    const injectionEvents = await this.transactionRepo.find({
      where: { student: { id: studentId }, status: TransactionStatus.FINISHED },
      relations: ['injectionEvent'],
      order: { injectionEvent: { date: 'DESC' } },
    });
    return injectionEvents;
  }

  async findStudentByInjectionEventId(injectionEventId: string) {
    const transactions = await this.transactionRepo.find({
      where: {
        injectionEvent: { id: injectionEventId },
        status: TransactionStatus.PAID,
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

  async checkExistTransaction(studentId: string, injectionEventId: string) {
    const foundTransaction = await this.transactionRepo.findOne({
      where: {
        student: { id: studentId },
        injectionEvent: { id: injectionEventId },
        status: TransactionStatus.FINISHED,
      },
    });

    if (foundTransaction)
      throw new BadRequestException('Học sinh này đã được đăng kí');
    return;
  }

  async checkValidRegistration(
    studentId: string,
    vaccinationId: string,
    maxDoses: number,
  ) {
    const studentVaccination = await this.studentVaccinationRepo.findOne({
      where: { student: { id: studentId }, vaccination: { id: vaccinationId } },
    });
    if (!studentVaccination) return;
    if (studentVaccination.doses >= maxDoses)
      throw new BadRequestException(
        'Học sinh này đã tiêm đủ cho loại vaccine này',
      );
    return;
  }
}
