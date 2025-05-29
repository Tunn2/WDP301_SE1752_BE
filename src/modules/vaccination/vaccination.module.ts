import { Module } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { VaccinationController } from './vaccination.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vaccination } from './entities/vaccine.entity';
import { StudentVaccination } from './entities/student-vaccination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vaccination, StudentVaccination])],
  controllers: [VaccinationController],
  providers: [VaccinationService],
})
export class VaccinationModule {}
