import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { GoogleMeetService } from '../google-meet/google-meet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../user/entities/user.entity';
import { EmailProducerService } from '../email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User])],
  controllers: [AppointmentController],
  providers: [AppointmentService, GoogleMeetService, EmailProducerService],
  exports: [EmailProducerService],
})
export class AppointmentModule {}
