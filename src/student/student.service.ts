/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { ParentStudent } from 'src/user/entities/parent-student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
  ) {}

  findAll() {
    return this.studentRepo.find();
  }

  async findById(studentId: string) {
    return await this.studentRepo.findOne({ where: { id: studentId } });
  }

  async findByParentId(parentId: string) {
    const parentStudents = await this.parentStudentRepo.find({
      where: { user: { id: parentId } },
      relations: ['student'],
    });
    const students = parentStudents.map((ps) => ps.student);
    return students;
  }
}
