import { Controller, Get, Param } from '@nestjs/common';
import { StudentInjectionService } from './student-injection.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('student-injection')
export class StudentInjectionController {
  constructor(
    private readonly studentInjectionService: StudentInjectionService,
  ) {}

  @Get('student/:id')
  async findByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Get injection events by student id successfully',
      await this.studentInjectionService.findByStudentId(studentId),
    );
  }
}
