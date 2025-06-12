import {
  Condition,
  TransactionStatus,
} from 'src/common/enums/transaction-status.enum';
import { InjectionEvent } from 'src/modules/injection-event/entities/injection-event.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  registrationDate: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: Condition, nullable: true })
  condition: Condition;

  @ManyToOne(() => Student, (student) => student.transactions)
  student: Student;

  @ManyToOne(() => User, (user) => user.transactions)
  parent: User;

  @ManyToOne(
    () => InjectionEvent,
    (injectionEvent) => injectionEvent.transactions,
  )
  injectionEvent: InjectionEvent;
}
