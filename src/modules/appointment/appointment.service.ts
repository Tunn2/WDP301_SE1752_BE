/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { GoogleMeetService } from '../google-meet/google-meet.service';
import { User } from '../user/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private googleMeetService: GoogleMeetService,
  ) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    nurseId: string,
  ): Promise<Appointment> {
    try {
      // Lấy thông tin nurse và parent
      const nurse = await this.userRepository.findOne({
        where: { id: nurseId, role: UserRole.NURSE },
      });
      const parent = await this.userRepository.findOne({
        where: { id: createAppointmentDto.parentId, role: UserRole.PARENT },
      });

      if (!nurse || !parent) {
        throw new Error('Nurse or Parent not found');
      }

      // Chuyển đổi appointmentTime nếu là chuỗi
      let startTime = createAppointmentDto.appointmentTime;
      if (typeof startTime === 'string') {
        startTime = dayjs(startTime, 'DD-MM-YYYY HH:mm:ss').toDate();
        if (isNaN(startTime.getTime())) {
          throw new Error('Invalid appointmentTime format');
        }
      }

      // Tính thời gian kết thúc
      const endTime = dayjs(startTime)
        .add(createAppointmentDto.duration, 'minute')
        .toString();

      // Tạo Google Meet
      const meetingData = await this.googleMeetService.createMeetingLink({
        summary: `Tư vấn y tế - ${nurse.fullName} & ${parent.fullName}`,
        description: createAppointmentDto.purpose || 'Cuộc hẹn tư vấn y tế',
        startTime: dayjs(startTime).format('YYYY-MM-DDTHH:mm:ss'),
        endTime,
        attendees: [nurse.email, parent.email],
      });

      // Lưu appointment với Google Meet link và eventId
      const appointment = this.appointmentRepository.create({
        ...createAppointmentDto,
        appointmentTime: startTime,
        googleMeetLink: meetingData.meetLink,
      });

      const savedAppointment =
        await this.appointmentRepository.save(appointment);
      this.logger.log(`Created appointment with ID: ${savedAppointment.id}`);
      return savedAppointment;
    } catch (error) {
      this.logger.error(`Failed to create appointment: ${error.message}`);
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  //   async updateAppointment(
  //     id: string,
  //     updateData: {
  //       appointmentTime?: Date | string;
  //       duration?: number;
  //       purpose?: string;
  //     },
  //   ): Promise<Appointment> {
  //     try {
  //       const appointment = await this.appointmentRepository.findOne({
  //         where: { id },
  //         relations: ['nurse', 'parent'],
  //       });

  //       if (!appointment) {
  //         throw new Error('Appointment not found');
  //       }

  //       // Chuyển đổi appointmentTime nếu là chuỗi
  //       let startTime = updateData.appointmentTime || appointment.appointmentTime;
  //       if (typeof startTime === 'string') {
  //         startTime = dayjs(startTime, 'DD-MM-YYYY HH:mm:ss').toDate();
  //         if (isNaN(startTime.getTime())) {
  //           throw new Error('Invalid appointmentTime format in update');
  //         }
  //       }

  //       // Cập nhật Google Meet nếu có thay đổi thời gian hoặc mục đích
  //       if (
  //         updateData.appointmentTime ||
  //         updateData.duration ||
  //         updateData.purpose
  //       ) {
  //         const duration = updateData.duration;
  //         const endTime = dayjs(startTime).add(duration, 'minute').toDate();

  //         await this.googleMeetService.updateMeeting(appointment.googleEventId, {
  //           startTime,
  //           endTime,
  //           description: updateData.purpose || appointment.purpose,
  //         });
  //         this.logger.log(`Updated Google Meet event for appointment ID: ${id}`);
  //       }

  //       // Cập nhật appointment
  //       Object.assign(appointment, {
  //         ...updateData,
  //         appointmentTime: startTime,
  //       });
  //       const updatedAppointment =
  //         await this.appointmentRepository.save(appointment);
  //       this.logger.log(`Updated appointment with ID: ${id}`);
  //       return updatedAppointment;
  //     } catch (error) {
  //       this.logger.error(`Failed to update appointment: ${error.message}`);
  //       throw new Error(`Failed to update appointment: ${error.message}`);
  //     }
  //   }

  //   async cancelAppointment(id: string): Promise<void> {
  //     try {
  //       const appointment = await this.appointmentRepository.findOne({
  //         where: { id },
  //       });

  //       if (!appointment) {
  //         throw new Error('Appointment not found');
  //       }

  //       // Xóa sự kiện trên Google Calendar nếu có googleEventId
  //       if (appointment.googleEventId) {
  //         await this.googleMeetService.deleteMeeting(appointment.googleEventId);
  //         this.logger.log(`Deleted Google Meet event for appointment ID: ${id}`);
  //       }

  //       // Cập nhật status
  //       appointment.status = 'cancelled';
  //       await this.appointmentRepository.save(appointment);
  //       this.logger.log(`Cancelled appointment with ID: ${id}`);
  //     } catch (error) {
  //       this.logger.error(`Failed to cancel appointment: ${error.message}`);
  //       throw new Error(`Failed to cancel appointment: ${error.message}`);
  //     }
  //   }
}
