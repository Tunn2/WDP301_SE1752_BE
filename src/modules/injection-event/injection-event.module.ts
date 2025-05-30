import { Module } from '@nestjs/common';
import { InjectionEventService } from './injection-event.service';
import { InjectionEventController } from './injection-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectionEvent } from './entities/injection-event.entity';
import { Student } from '../student/entities/student.entity';
import { Vaccination } from '../vaccination/entities/vaccine.entity';
import { ParentStudent } from '../user/entities/parent-student.entity';
import { StudentInjectionEvent } from '../student-injection/entities/student-injection-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InjectionEvent,
      Student,
      Vaccination,
      ParentStudent,
      StudentInjectionEvent,
    ]),
  ],
  controllers: [InjectionEventController],
  providers: [InjectionEventService],
})
export class InjectionEventModule {}
