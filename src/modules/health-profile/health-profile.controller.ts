/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { CreateHealthProfileDto } from './dto/create-health-profile.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('health-profile')
export class HealthProfileController {
  constructor(private readonly healthProfileService: HealthProfileService) {}

  @Get('student/:id')
  @ApiOperation({
    summary: 'Lấy hồ sơ sức khỏe của học sinh theo student id',
  })
  async findByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Get health profiles by student id successfully',
      await this.healthProfileService.findByStudentId(studentId),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hồ sơ sức khỏe theo id' })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Get health profile by id successfully',
      await this.healthProfileService.findById(id),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hồ sơ sức khỏe cho học sinh' })
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
  @Get('export-health-profiles/:studentId')
  async exportHealthProfiles(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.healthProfileService.exportHealthProfilesByStudentId(
        studentId,
      );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=health-profile-${studentId}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('student/:id/latest')
  @ApiOperation({ summary: 'Lấy hồ sơ sức khỏe mới nhất' })
  async findLatestByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.healthProfileService.findLatestByStudentId(studentId),
    );
  }
}
