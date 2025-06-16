import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Slot } from './slot.entity';

@Entity()
export class SlotMedicine {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  quantity: number;

  @ManyToOne(() => Slot, (slot) => slot.medicines)
  slot: Slot;
}
