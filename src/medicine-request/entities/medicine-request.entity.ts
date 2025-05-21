import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MedicineRequest {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column()
  image: string;

  @Column()
  note: string;

  @ManyToOne(() => Student, (student) => student.medicinesRequests)
  student: Student;

  @ManyToOne(() => User, (parent) => parent.medicineRequests)
  parent: User;
}
