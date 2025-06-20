import { UserRole } from 'src/common/enums/user-role.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ParentStudent } from './parent-student.entity';
import { HealthProfile } from 'src/modules/health-profile/entities/health-profile.entity';
import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import { Accident } from 'src/modules/accident/entities/accident.entity';
import { Message } from 'src/modules/chat-ai/entities/message.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { Slot } from 'src/modules/slot/entities/slot.entity';
import { PostInjectionReport } from 'src/modules/post-injection-report/entities/post-injection-report.entity';
import { Appointment } from 'src/modules/appointment/entities/appointment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToMany(() => ParentStudent, (studentUser) => studentUser.user)
  studentUsers: ParentStudent[];

  @OneToMany(() => HealthProfile, (healthProfile) => healthProfile.user)
  healthProfiles: HealthProfile[];

  @OneToMany(() => MedicineRequest, (medicineRequest) => medicineRequest.parent)
  medicineRequests: MedicineRequest[];

  @OneToMany(() => Accident, (accident) => accident.nurse)
  accidents: Accident[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => Transaction, (transaction) => transaction.parent)
  transactions: Transaction[];

  @OneToMany(() => Slot, (slot) => slot.nurse)
  slots: Slot[];

  @OneToMany(() => PostInjectionReport, (report) => report.createdBy)
  injectionReports: PostInjectionReport[];

  @OneToMany(() => Appointment, (appointment) => appointment.nurse)
  nurseAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.parent)
  parentAppointments: Appointment[];
}
