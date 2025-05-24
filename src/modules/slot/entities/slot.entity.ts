import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  session: string;

  @Column()
  note: string;

  @Column({ default: false })
  status: boolean;

  @Column()
  image: string;

  @ManyToOne(() => MedicineRequest, (medicineRequest) => medicineRequest.slots)
  medicineRequest: MedicineRequest;
}
