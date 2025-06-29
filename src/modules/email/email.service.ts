import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface AppointmentNotiDto {
  email: string;
  name: string;
  appointmentTime: string;
  userId: string;
}

@Injectable()
export class EmailProducerService {
  constructor(
    @Inject('EMAIL_SERVICE') private readonly emailClient: ClientProxy,
  ) {}

  sendAppointmentNoti(data: AppointmentNotiDto) {
    console.log('📤 Sending email message to queue:', data);
    return this.emailClient.emit('send_appointment_noti', data);
  }
}
