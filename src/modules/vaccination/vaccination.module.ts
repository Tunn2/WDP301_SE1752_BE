import { Module } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { VaccinationController } from './vaccination.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vaccination } from './entities/vaccine.entity';
import { StudentVaccination } from './entities/student-vaccination.entity';
import { ExcelService } from '../excel/excel.service';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vaccination, StudentVaccination, Student]),
  ],
  controllers: [VaccinationController],
  providers: [VaccinationService, ExcelService],
})
export class VaccinationModule {}
