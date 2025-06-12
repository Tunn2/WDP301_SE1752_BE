import { Accident } from 'src/modules/accident/entities/accident.entity';
import { HealthEventStudent } from 'src/modules/health-event/entities/health-event-student.entity';
import { HealthProfile } from 'src/modules/health-profile/entities/health-profile.entity';
import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';
import { StudentVaccination } from 'src/modules/vaccination/entities/student-vaccination.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  studentCode: string;

  @Column()
  class: string;

  @Column()
  fullName: string;

  @Column()
  address: string;

  @Column()
  gender: string;

  @OneToMany(() => ParentStudent, (studentUser) => studentUser.student)
  studentUsers: ParentStudent[];

  @OneToMany(() => HealthProfile, (healthProfile) => healthProfile.student)
  healthProfiles: HealthProfile[];

  @OneToMany(
    () => MedicineRequest,
    (medicineRequest) => medicineRequest.student,
  )
  medicinesRequests: MedicineRequest[];

  @OneToMany(() => Accident, (accident) => accident.student)
  accidents: Accident[];

  @OneToMany(
    () => HealthEventStudent,
    (healthEventStudent) => healthEventStudent.student,
  )
  healthEventStudents: HealthEventStudent[];

  @OneToMany(
    () => StudentVaccination,
    (studentVaccination) => studentVaccination.student,
  )
  studentVaccinations: StudentVaccination[];

  @OneToMany(() => Transaction, (transaction) => transaction.student)
  transactions: Transaction[];
}
