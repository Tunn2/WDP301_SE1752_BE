import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { HealthEventStudent } from './health-event-student.entity';

@Entity()
export class HealthEvent {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @OneToMany(
    () => HealthEventStudent,
    (healthEventStudent) => healthEventStudent.healthEvent,
  )
  healthEventStudents: HealthEventStudent[];
}
