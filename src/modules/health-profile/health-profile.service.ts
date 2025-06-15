import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHealthProfileDto } from './dto/create-health-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HealthProfile } from './entities/health-profile.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/modules/student/entities/student.entity';

import { getCurrentTimeInBangkok } from 'src/common/utils/date.util';

@Injectable()
export class HealthProfileService {
  constructor(
    @InjectRepository(HealthProfile)
    private healthProfileRepo: Repository<HealthProfile>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
  ) {}

  async createOne(request: CreateHealthProfileDto, userId: string) {
    const student = await this.studentRepo.findOne({
      where: { id: request.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const newHealthProfile = this.healthProfileRepo.create({
      ...request,
      student,
      user: { id: userId },
      date: getCurrentTimeInBangkok(),
    });
    await this.healthProfileRepo.save(newHealthProfile);
  }

  async findByStudentId(studentId: string) {
    return await this.healthProfileRepo.findOne({
      where: { student: { id: studentId } },
      order: { date: 'DESC' },
      relations: ['user', 'student'],
    });
  }

  async findById(id: string) {
    const healthProfile = await this.healthProfileRepo.findOne({
      where: { id },
      relations: ['user', 'student'],
    });
    if (!healthProfile) {
      throw new NotFoundException('Health profile not found');
    }
    return healthProfile;
  }

  async findLatestByStudentId(id: string) {
    const healthProfile = await this.healthProfileRepo.findOne({
      where: { student: { id } },
      order: { date: 'DESC' },
      relations: ['student'],
    });
    return healthProfile;
  }
}
