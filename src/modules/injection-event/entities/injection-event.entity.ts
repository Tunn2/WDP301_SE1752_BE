import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vaccination } from '../../vaccination/entities/vaccine.entity';
import { StudentInjectionEvent } from 'src/modules/student-injection/entities/student-injection-event.entity';

@Entity()
export class InjectionEvent {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'timestamp' })
  registrationOpenDate: Date;

  @Column({ type: 'timestamp' })
  registrationCloseDate: Date;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  price: number;

  @ManyToOne(() => Vaccination, (vaccination) => vaccination.injectionEvents)
  vaccination: Vaccination;

  @OneToMany(
    () => StudentInjectionEvent,
    (studentInjectionEvent) => studentInjectionEvent.injectionEvent,
  )
  studentInjectionEvents: StudentInjectionEvent[];
}
