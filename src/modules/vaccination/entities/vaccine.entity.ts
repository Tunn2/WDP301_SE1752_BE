import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InjectionEvent } from '../../injection-event/entities/injection-event.entity';
import { StudentVaccination } from './student-vaccination.entity';
import { VaccinationType } from 'src/common/enums/vaccination-type.enum';

@Entity()
export class Vaccination {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: VaccinationType })
  type: VaccinationType;

  @Column()
  numberOfDoses: number;

  @OneToMany(
    () => InjectionEvent,
    (injectionEvent) => injectionEvent.vaccination,
  )
  injectionEvents: InjectionEvent[];

  @OneToMany(
    () => StudentVaccination,
    (studentVaccination) => studentVaccination.vaccination,
  )
  studentVaccinations: StudentVaccination[];
}
