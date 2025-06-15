/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách học sinh',
  })
  async findAll() {
    const students = await this.studentService.findAll();
    return new ResponseDTO(200, true, 'Get students successfully', students);
  }

  @Get('parent')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách học sinh theo id của phụ huynh thông qua token',
  })
  @ApiBearerAuth('JWT-auth')
  async findByParentId(@Request() req) {
    return new ResponseDTO(
      200,
      true,
      'Get students by parent id successfully',
      await this.studentService.findByParentId(req.user.userId),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy thông tin học sinh theo id',
  })
  @ApiBearerAuth('JWT-auth')
  async findById(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Get student by id successfully',
      await this.studentService.findById(studentId),
    );
  }
}
