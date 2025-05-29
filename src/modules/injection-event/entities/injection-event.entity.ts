import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vaccination } from '../../vaccination/entities/vaccine.entity';

@Entity()
export class InjectionEvent {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Vaccination, (vaccination) => vaccination.injectionEvents)
  vaccination: Vaccination;
}
