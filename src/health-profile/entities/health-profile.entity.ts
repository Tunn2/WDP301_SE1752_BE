import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Student, (student) => student.healthProfiles)
  student: Student;

  @ManyToOne(() => User, (user) => user.healthProfiles)
  user: User;

  @Column({ nullable: false })
  weight: number;

  @Column({ nullable: false })
  height: number;

  @Column()
  bloodType: string;

  @Column()
  allergies: string;

  @Column()
  hearing: number;

  @Column()
  vision: number;

  @Column()
  note: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
