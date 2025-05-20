import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { ParentStudent } from './entities/parent-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, ParentStudent])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
