import { Accident } from 'src/modules/accident/entities/accident.entity';
import { Medicine } from 'src/modules/medicine/entities/medicine.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AccidentMedicine {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Accident, (accident) => accident.accidentMedicines)
  accident: Accident;

  @ManyToOne(() => Medicine, (medicine) => medicine.accidentMedicines)
  medicine: Medicine;

  @Column()
  quantity: number;
}
