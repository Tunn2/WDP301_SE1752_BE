import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InjectionRecord } from '../../injection-record/entities/injection-record.entity';
import { User } from 'src/modules/user/entities/user.entity';

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity()
export class PostInjectionReport {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'enum', enum: SeverityLevel })
  severityLevel: SeverityLevel;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number;

  @Column()
  hoursPostInjection: number;

  @Column({ type: 'timestamp' })
  createdAt: Date;
  @ManyToOne(() => User, (user) => user.injectionReports)
  createdBy: User;

  @ManyToOne(
    () => InjectionRecord,
    (injectionRecord) => injectionRecord.injectionReports,
  )
  injectionRecord: InjectionRecord;
}
