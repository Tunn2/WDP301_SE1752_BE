import { AccidentMedicine } from 'src/modules/accident-medicine/entities/accident-medicine.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  manufacturer: string;
  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column()
  type: string;

  @OneToMany(
    () => AccidentMedicine,
    (accidentMedicine) => accidentMedicine.medicine,
  )
  accidentMedicines: AccidentMedicine[];
}
