import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SlotMedicine } from './slot-medicine.entity';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  session: string;

  @Column({ nullable: true })
  note: string;

  @Column({ default: false })
  status: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => SlotMedicine, (slotMedicine) => slotMedicine.slot, {
    cascade: true,
  })
  medicines: SlotMedicine[];

  @ManyToOne(() => MedicineRequest, (medicineRequest) => medicineRequest.slots)
  medicineRequest: MedicineRequest;

  @ManyToOne(() => User, (nurse) => nurse.slots)
  nurse: User;
}
