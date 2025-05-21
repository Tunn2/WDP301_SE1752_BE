import { Student } from 'src/student/entities/student.entity';
import { ParentStudent } from 'src/user/entities/parent-student.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class HealProfile {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne()
  student: Student;

  @Column()
  fullName: string;

  @Column()
  address: string;

  @OneToMany(() => ParentStudent, (studentUser) => studentUser.student)
  studentUsers: ParentStudent[];
}
