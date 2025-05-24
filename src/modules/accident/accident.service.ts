/* eslint-disable @typescript-eslint/await-thenable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accident } from './entities/accident.entity';
import { Repository } from 'typeorm';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { Student } from 'src/modules/student/entities/student.entity';

@Injectable()
export class AccidentService {
  constructor(
    @InjectRepository(Accident) private accidentRepo: Repository<Accident>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
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
    });

    await this.accidentRepo.save(accident);

    return accident;
  }
}
