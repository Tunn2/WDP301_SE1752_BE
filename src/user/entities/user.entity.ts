import { UserRole } from 'src/common/enums/user-role.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ParentStudent } from './parent-student.entity';

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
}
