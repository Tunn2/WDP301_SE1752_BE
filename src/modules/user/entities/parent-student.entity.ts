// student-user.entity.ts
import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { ParentType } from 'src/common/enums/parent-type.enum';

@Entity()
export class ParentStudent {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.studentUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  user: User;

  @ManyToOne(() => Student, (student) => student.studentUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({
    type: 'enum',
    enum: ParentType,
  })
  relationship: ParentType;
}
