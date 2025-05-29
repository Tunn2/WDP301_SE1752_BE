import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vaccination } from './entities/vaccine.entity';
import { Repository } from 'typeorm';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { StudentVaccination } from './entities/student-vaccination.entity';
import { CreateStudentVaccinationDto } from './dto/create-student-vaccination.dto';

@Injectable()
export class VaccinationService {
  constructor(
    @InjectRepository(Vaccination)
    private vaccinationRepo: Repository<Vaccination>,
    @InjectRepository(StudentVaccination)
    private studentVaccinationRepo: Repository<StudentVaccination>,
  ) {}

  async findAll() {
    return await this.vaccinationRepo.find();
  }

  async create(request: CreateVaccinationDto) {
    const foundVaccination = await this.vaccinationRepo.findOne({
      where: { name: request.name },
    });

    if (foundVaccination)
      throw new BadRequestException('This vaccination is already existed');

    await this.vaccinationRepo.save({ ...request });
  }

  async addStudentVaccination(request: CreateStudentVaccinationDto) {
    try {
      const foundVaccination = await this.vaccinationRepo.findOne({
        where: { id: request.vaccinationId },
      });
      if (!foundVaccination)
        throw new NotFoundException('Vaccination not found');

      if (request.doses > foundVaccination.numberOfDoses)
        throw new BadRequestException(
          `Maximum doses is ${foundVaccination.numberOfDoses}`,
        );
      await this.studentVaccinationRepo.save({ ...request });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
