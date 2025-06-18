import { InjectionEvent } from 'src/modules/injection-event/entities/injection-event.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum InjectionStatus {
  SCHEDULED = 'scheduled',
  CLEARED_FOR_INJECTION = 'cleared_for_injection', // Đủ điều kiện tiêm
  DEFERRED = 'deferred', // Hoãn tiêm (do sốt hoặc bệnh)
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

export enum HealthStatus {
  NORMAL = 'normal',
  MILD_REACTION = 'mild_reaction',
  MODERATE_REACTION = 'moderate_reaction',
  SEVERE_REACTION = 'severe_reaction',
  HOSPITALIZED = 'hospitalized',
}

@Entity()
export class InjectionRecord {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Student, (student) => student.injectionRecords)
  student: Student;

  @ManyToOne(
    () => InjectionEvent,
    (injectionEvent) => injectionEvent.injectionRecords,
  )
  injectionEvent: InjectionEvent;

  @Column({ type: 'timestamp' })
  registrationDate: Date;

  @Column({
    type: 'enum',
    enum: InjectionStatus,
    default: InjectionStatus.SCHEDULED,
  })
  injectionStatus: InjectionStatus;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  preInjectionTemperature: number; // Nhiệt độ trước tiêm

  @Column({ type: 'text', nullable: true })
  preInjectionHealthNotes: string;

  @Column({ nullable: true })
  hasPreExistingConditions: boolean;

  @Column({ type: 'text', nullable: true })
  preExistingConditions: string;

  @Column({ nullable: true })
  eligibleForInjection: boolean;

  @Column({ type: 'text', nullable: true })
  deferralReason: string;

  @Column({ nullable: true })
  injectionSite: string;

  // === THÔNG TIN SAU TIÊM ===
  @Column({
    type: 'enum',
    enum: HealthStatus,
    nullable: true,
  })
  healthStatus: HealthStatus;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  postInjectionTemperature: number; // Nhiệt độ sau tiêm

  @Column({ type: 'text', nullable: true })
  sideEffects: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
