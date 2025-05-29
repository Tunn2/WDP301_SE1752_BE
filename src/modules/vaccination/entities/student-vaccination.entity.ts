import { Student } from 'src/modules/student/entities/student.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vaccination } from './vaccine.entity';

@Entity()
export class StudentVaccination {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  doses: number;

  @ManyToOne(() => Student, (student) => student.studentVaccinations)
  student: Student;

  @ManyToOne(
    () => Vaccination,
    (vaccination) => vaccination.studentVaccinations,
  )
  vaccination: Vaccination;
}
