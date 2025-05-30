import { StudentInjectionEventStatus } from 'src/common/enums/student-injection-event.enum';
import { InjectionEvent } from 'src/modules/injection-event/entities/injection-event.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StudentInjectionEvent {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  registrationDate: Date;

  @Column({
    type: 'enum',
    enum: StudentInjectionEventStatus,
    default: StudentInjectionEventStatus.PENDING,
  })
  status: StudentInjectionEventStatus;

  @ManyToOne(() => Student, (student) => student.studentInjectionEvents)
  student: Student;

  @ManyToOne(() => User, (user) => user.studentInjectionEvents)
  parent: User;

  @ManyToOne(
    () => InjectionEvent,
    (injectionEvent) => injectionEvent.studentInjectionEvents,
  )
  injectionEvent: InjectionEvent;
}
