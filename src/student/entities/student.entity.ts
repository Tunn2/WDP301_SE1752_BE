import { ParentStudent } from 'src/user/entities/parent-student.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  studentCode: string;

  @Column()
  fullName: string;

  @Column()
  address: string;

  @OneToMany(() => ParentStudent, (studentUser) => studentUser.student)
  studentUsers: ParentStudent[];
}
