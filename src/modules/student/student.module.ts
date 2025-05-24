import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Student, ParentStudent])],
  controllers: [StudentController],
  providers: [StudentService, JwtStrategy],
})
export class StudentModule {}
