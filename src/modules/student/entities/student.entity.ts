import { Accident } from 'src/modules/accident/entities/accident.entity';
import { HealthProfile } from 'src/modules/health-profile/entities/health-profile.entity';
import { MedicineRequest } from 'src/modules/medicine-request/entities/medicine-request.entity';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  studentCode: string;

  @Column()
  fullName: string;

  @Column()
  address: string;

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
}
