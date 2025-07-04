/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangeAppointmentTimeDto } from './dto/change-appointment-time.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo lịch hẹn',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async createAppointment(
    @Body() request: CreateAppointmentDto,
    @Request() req,
  ) {
    return new ResponseDTO(
      201,
      true,
      'Successful',
      await this.appointmentService.createAppointment(request, req.user.userId),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy tất cả lịch hẹn',
  })
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Successful',
      await this.appointmentService.findAll(),
    );
  }

  @Get('user')
  @ApiOperation({
    summary: 'Lấy lịch hẹn theo người dùng',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async findByUserId(@Request() req) {
    return new ResponseDTO(
      200,
      true,
      'Successful',
      await this.appointmentService.findByUserId(req.user.userId),
    );
  }

  @Get('today')
  @ApiOperation({
    summary: 'Lấy lịch hẹn theo người dùng hôm nay',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async findTodayByUserId(@Request() req) {
    return new ResponseDTO(
      200,
      true,
      'Successful',
      await this.appointmentService.findTodayByUserId(req.user.userId),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy lịch hẹn theo id',
  })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successful',
      await this.appointmentService.findById(id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Thay đổi lịch hẹn' })
  async changeSchedule(
    @Param('id') id: string,
    request: ChangeAppointmentTimeDto,
  ) {
    return new ResponseDTO(
      200,
      true,
      'Successful',
      await this.appointmentService.changeSchedule(id, request),
    );
  }
}
