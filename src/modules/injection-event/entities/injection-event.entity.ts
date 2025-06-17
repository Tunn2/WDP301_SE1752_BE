import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vaccination } from '../../vaccination/entities/vaccine.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { InjectionRecord } from 'src/modules/injection-record/entities/injection-record.entity';

@Entity()
export class InjectionEvent {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'timestamp' })
  registrationOpenDate: Date;

  @Column({ type: 'timestamp' })
  registrationCloseDate: Date;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  price: number;

  @ManyToOne(() => Vaccination, (vaccination) => vaccination.injectionEvents)
  vaccination: Vaccination;

  @OneToMany(() => Transaction, (transaction) => transaction.injectionEvent)
  transactions: Transaction[];

  @OneToMany(
    () => InjectionRecord,
    (injectionRecord) => injectionRecord.injectionEvent,
  )
  injectionRecords: InjectionRecord;
}
