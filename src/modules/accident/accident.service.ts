/* eslint-disable @typescript-eslint/await-thenable */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accident } from './entities/accident.entity';
import { Repository } from 'typeorm';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { Student } from 'src/modules/student/entities/student.entity';
import {
  formatToVietnamTime,
  getCurrentTimeInVietnam,
} from 'src/common/utils/date.util';
import { AccidentStatus } from 'src/common/enums/accident-status.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { ParentStudent } from '../user/entities/parent-student.entity';

@Injectable()
export class AccidentService {
  constructor(
    @InjectRepository(Accident) private accidentRepo: Repository<Accident>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
    private mailerService: MailerService,
  ) {}

  async create(nurseId: string, request: CreateAccidentDto) {
    const student = await this.studentRepo.findOne({
      where: { studentCode: request.studentCode },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const accident = this.accidentRepo.create({
      ...request,
      nurse: { id: nurseId },
      student: { id: student.id },
      date: getCurrentTimeInVietnam(),
    });
    await this.accidentRepo.save(accident);
    const parents = await this.parentStudentRepo.find({
      where: { student },
      relations: ['user'],
    });
    parents.forEach((parent) => {
      this.mailerService.sendMail({
        to: parent.user.email,
        subject: 'Có sự cố với con bạn',
        template: 'accident',
        context: {
          name: student.fullName,
          date: accident.date,
          description: accident.summary,
        },
      });
    });
    return accident;
  }

  async findAll() {
    const accidents = await this.accidentRepo.find({
      order: { date: 'DESC' },
      relations: ['accidentMedicines', 'student', 'nurse'],
    });
    return accidents.map((accident) => ({
      ...accident,
      date: formatToVietnamTime(accident.date),
    }));
  }

  async findById(id: string) {
    const accident = await this.accidentRepo.findOne({
      where: { id },
      relations: ['student', 'nurse', 'accidentMedicines.medicine'],
    });
    if (!accident) throw new NotFoundException('Accident not found');
    return accident;
  }

  async updateAccidentStatusById(id: string, status: AccidentStatus) {
    const foundAccident = await this.findById(id);
    foundAccident.status = status;
    await this.accidentRepo.save(foundAccident);
  }
}
