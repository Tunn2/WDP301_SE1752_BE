import { Module } from '@nestjs/common';
import { HealthEventService } from './health-event.service';
import { HealthEventController } from './health-event.controller';
import { HealthProfileModule } from '../health-profile/health-profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthEvent } from './entities/health-event.entity';
import { HealthProfile } from '../health-profile/entities/health-profile.entity';
import { HealthEventStudent } from './entities/health-event-student.entity';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [
    HealthProfileModule,
    TypeOrmModule.forFeature([
      HealthEvent,
      HealthProfile,
      HealthEventStudent,
      Student,
    ]),
  ],
  controllers: [HealthEventController],
  providers: [HealthEventService],
})
export class HealthEventModule {}
