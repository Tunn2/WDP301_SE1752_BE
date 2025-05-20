import { Controller, Get } from '@nestjs/common';
import { StudentService } from './student.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async findAll() {
    const students = await this.studentService.findAll();
    return new ResponseDTO(200, true, 'Get students successfully', students);
  }
}
