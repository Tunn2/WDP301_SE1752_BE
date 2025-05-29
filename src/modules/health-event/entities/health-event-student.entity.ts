import { Student } from 'src/modules/student/entities/student.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HealthEvent } from './health-event.entity';
import { HealthProfile } from 'src/modules/health-profile/entities/health-profile.entity';

@Entity()
export class HealthEventStudent {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Student, (student) => student.healthEventStudents)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(
    () => HealthEvent,
    (healthEvent) => healthEvent.healthEventStudents,
  )
  @JoinColumn({ name: 'healthEventId' })
  healthEvent: HealthEvent;

  @OneToOne(
    () => HealthProfile,
    (healthProfile) => healthProfile.healthEventStudent,
  )
  @JoinColumn({ name: 'healthProfileId' })
  healthProfile: HealthProfile;
}
