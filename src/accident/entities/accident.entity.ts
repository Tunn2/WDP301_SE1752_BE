import { AccidentMedicine } from 'src/accident-medicine/entities/accident-medicine.entity';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Accident {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  summary: string;

  @Column()
  type: string;

  @ManyToOne(() => User, (nurse) => nurse.accidents)
  nurse: User;

  @ManyToOne(() => Student, (student) => student.accidents)
  student: Student;

  @OneToMany(
    () => AccidentMedicine,
    (accidentMedicine) => accidentMedicine.accident,
  )
  accidentMedicines: AccidentMedicine[];
}
