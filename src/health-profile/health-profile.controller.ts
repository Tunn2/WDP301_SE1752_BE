/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { CreateHealthProfileDto } from './dto/create-health-profile.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('health-profile')
export class HealthProfileController {
  constructor(private readonly healthProfileService: HealthProfileService) {}

  @Get('student/:id')
  async findByStudentId(@Query('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Get health profiles by student id successfully',
      await this.healthProfileService.findByStudentId(studentId),
    );
  }

  @Get(':id')
  async findById(@Query('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Get health profile by id successfully',
      await this.healthProfileService.findById(id),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateHealthProfileDto })
  async create(@Body() request: CreateHealthProfileDto, @Request() req) {
    await this.healthProfileService.createOne(request, req.user.userId);
    return new ResponseDTO(
      201,
      true,
      'Create health profile successfully',
      null,
    );
  }
}
