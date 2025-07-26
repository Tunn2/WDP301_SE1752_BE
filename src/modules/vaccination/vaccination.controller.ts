import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { CreateStudentVaccinationDto } from './dto/create-student-vaccination.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('vaccination')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Get()
  @ApiOperation({
    summary: 'Những vaccine mà nhà trường hỗ trợ tiêm tại trường',
  })
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Get all vaccinations successfully',
      await this.vaccinationService.findAll(),
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Khai báo vaccine mà nhà trường hỗ trợ',
  })
  async create(@Body() request: CreateVaccinationDto) {
    await this.vaccinationService.create(request);
    return new ResponseDTO(201, true, 'Create vaccination successfully', null);
  }

  @Post('student')
  @ApiOperation({
    summary:
      'Phụ huynh khai báo những vaccine mà nhà trường hỗ trợ đã tiêm ngoài trường cho học sinh',
  })
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
  @ApiOperation({
    summary: 'Những vaccine mà học sinh đã tiêm',
  })
  async findByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.vaccinationService.findByStudentId(studentId),
    );
  }

  @Get('export-health-profiles/:studentId')
  async exportHealthProfiles(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.vaccinationService.exportVaccinationsByStudentId(studentId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=vaccination-${studentId}.xlsx`,
    );
    res.send(buffer);
  }
}
