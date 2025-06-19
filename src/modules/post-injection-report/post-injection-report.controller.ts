/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { PostInjectionReportService } from './post-injection-report.service';
import { CreatePostInjectionReportDto } from './dto/create-post-injection-report.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('post-injection-report')
export class PostInjectionReportController {
  constructor(
    private readonly postInjectionReportService: PostInjectionReportService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Phụ huynh tạo vấn đề sau tiêm nếu có',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async create(@Request() req, @Body() request: CreatePostInjectionReportDto) {
    return new ResponseDTO(
      201,
      true,
      'Successfully',
      await this.postInjectionReportService.create(request, req.user.userId),
    );
  }

  @Get('injection-record/:id')
  async findByInjectionRecordId(@Param(':id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.postInjectionReportService.findByInjectionRecordId(id),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy vấn đề sau tiêm bằng id',
  })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.postInjectionReportService.findById(id),
    );
  }
}
