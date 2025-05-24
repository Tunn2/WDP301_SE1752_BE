import { Slot } from 'src/modules/slot/entities/slot.entity';
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
export class MedicineRequest {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: 'timestamp',
  })
  date: Date;

  @Column()
  image: string;

  @Column()
  note: string;

  @ManyToOne(() => Student, (student) => student.medicinesRequests)
  student: Student;

  @ManyToOne(() => User, (parent) => parent.medicineRequests)
  parent: User;

  @OneToMany(() => Slot, (slot) => slot.medicineRequest)
  slots: Slot[];
}
