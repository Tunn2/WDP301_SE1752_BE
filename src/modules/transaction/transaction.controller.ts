import { Controller, Get, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('student/:id')
  async findInjectionEventsByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.transactionService.findInjectionEventHistoryByStudentId(
        studentId,
      ),
    );
  }

  @Get('register/:studentId')
  async findRegisterSuccessfullyByStudentId(@Param('id') studentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.transactionService.findRegisterSuccessfullyByStudentId(
        studentId,
      ),
    );
  }

  @Get('parent/:id')
  async findByParentId(@Param('id') parentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.transactionService.findByParentId(parentId),
    );
  }
}
