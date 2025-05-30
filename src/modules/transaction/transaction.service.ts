import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Student } from '../student/entities/student.entity';
import { InjectionEvent } from '../injection-event/entities/injection-event.entity';
import { User } from '../user/entities/user.entity';
import { getCurrentTimeInBangkok } from 'src/common/utils/date.util';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(InjectionEvent)
    private injectionEventRepo: Repository<InjectionEvent>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}
  async create(
    studentId: string,
    parentId: string,
    injectionEventId: string,
  ): Promise<Transaction> {
    const foundParent = await this.userRepo.findOne({
      where: { id: parentId },
    });
    const foundStudent = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    const foundInjectionEvent = await this.injectionEventRepo.findOne({
      where: { id: injectionEventId },
    });

    if (!foundStudent || !foundParent || !foundInjectionEvent)
      throw new NotFoundException(
        'Student or parent or injection event not found',
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
}
