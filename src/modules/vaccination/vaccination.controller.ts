import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { CreateStudentVaccinationDto } from './dto/create-student-vaccination.dto';

@Controller('vaccination')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Get()
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Get all vaccinations successfully',
      await this.vaccinationService.findAll(),
    );
  }

  @Post()
  async create(@Body() request: CreateVaccinationDto) {
    await this.vaccinationService.create(request);
    return new ResponseDTO(201, true, 'Create vaccination successfully', null);
  }

  @Post('student')
  async createStudentVaccination(@Body() request: CreateStudentVaccinationDto) {
    await this.vaccinationService.addStudentVaccination(request);
    return new ResponseDTO(
      201,
      true,
      'Create student vaccination successfully',
      null,
    );
  }

  @Get('student/:id')
  async findByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.vaccinationService.findByStudentId(studentId),
    );
  }
}
