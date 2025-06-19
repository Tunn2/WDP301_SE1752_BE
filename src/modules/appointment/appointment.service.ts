/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { GoogleMeetService } from '../google-meet/google-meet.service';
import { User } from '../user/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getCurrentTimeInVietnam } from 'src/common/utils/date.util';

dayjs.extend(customParseFormat);

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private googleMeetService: GoogleMeetService,
  ) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    nurseId: string,
  ): Promise<Appointment> {
    try {
      // Lấy thông tin nurse và parent
      const nurse = await this.userRepo.findOne({
        where: { id: nurseId, role: UserRole.NURSE },
      });
      const parent = await this.userRepo.findOne({
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

      // Tạo Google Meet
      const meetingData = await this.googleMeetService.createMeetingSpace();
      // Lưu appointment với Google Meet link và eventId
      const appointment = this.appointmentRepo.create({
        ...createAppointmentDto,
        appointmentTime: startTime,
        googleMeetLink: meetingData.data.meetingUri,
        createdAt: getCurrentTimeInVietnam(),
        updatedAt: getCurrentTimeInVietnam(),
      });

      const savedAppointment = await this.appointmentRepo.save(appointment);
      this.logger.log(`Created appointment with ID: ${savedAppointment.id}`);
      return savedAppointment;
    } catch (error) {
      this.logger.error(`Failed to create appointment: ${error.message}`);
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  async findAll() {
    return await this.appointmentRepo.find({
      order: { appointmentTime: 'DESC' },
    });
  }

  async findByUserId(userId: string) {
    const foundUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!foundUser) throw new BadRequestException('User not found');
    if (foundUser.role == UserRole.NURSE)
      return this.appointmentRepo.find({
        where: { nurse: { id: userId } },
        order: { appointmentTime: 'DESC' },
      });
    return await this.appointmentRepo.find({
      where: { parent: { id: userId } },
      order: { appointmentTime: 'DESC' },
    });
  }
}
