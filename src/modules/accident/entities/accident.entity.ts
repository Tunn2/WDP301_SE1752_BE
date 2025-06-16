import { AccidentStatus } from 'src/common/enums/accident-status.enum';
import { AccidentMedicine } from 'src/modules/accident-medicine/entities/accident-medicine.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { User } from 'src/modules/user/entities/user.entity';
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

  @Column({
    type: 'enum',
    enum: AccidentStatus,
    default: AccidentStatus.MEDICAL_ROOM,
  })
  status: AccidentStatus;

  @Column({ type: 'timestamp' })
  date: Date;
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
