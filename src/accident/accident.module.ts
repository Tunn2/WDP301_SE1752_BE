import { Module } from '@nestjs/common';
import { AccidentService } from './accident.service';
import { AccidentController } from './accident.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accident } from './entities/accident.entity';
import { Student } from 'src/student/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accident, Student])],
  controllers: [AccidentController],
  providers: [AccidentService],
})
export class AccidentModule {}
