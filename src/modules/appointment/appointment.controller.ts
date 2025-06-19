/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
