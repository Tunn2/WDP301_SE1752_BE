import { UserRole } from 'src/common/enums/user-role.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ParentStudent } from './parent-student.entity';
import { HealthProfile } from 'src/health-profile/entities/health-profile.entity';
import { MedicineRequest } from 'src/medicine-request/entities/medicine-request.entity';

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
}
