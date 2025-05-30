import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentInjectionEvent } from './entities/student-injection-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentInjectionService {
  constructor(
    @InjectRepository(StudentInjectionEvent)
    private studentInjectionEventRepo: Repository<StudentInjectionEvent>,
  ) {}

  async findByStudentId(studentId: string) {
    const studentInjectionEvents = await this.studentInjectionEventRepo.find({
      where: { student: { id: studentId } },
      relations: ['injectionEvent'],
    });
    return studentInjectionEvents;
  }
}
