import { Module } from '@nestjs/common';
import { AccidentService } from './accident.service';
import { AccidentController } from './accident.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accident } from './entities/accident.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { ParentStudent } from '../user/entities/parent-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accident, Student, ParentStudent])],
  controllers: [AccidentController],
  providers: [AccidentService],
})
export class AccidentModule {}
