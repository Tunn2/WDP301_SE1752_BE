import { Controller, Get, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('student/:id')
  @ApiOperation({
    summary: 'Những injection event mà student đã tiêm tại trường',
  })
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
  @ApiOperation({
    summary:
      'Những injection event mà parent đã đăng kí thành công cho student đó',
  })
  async findRegisterSuccessfullyByStudentId(
    @Param('studentId') studentId: string,
  ) {
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
  @ApiOperation({
    summary: 'Lịch sử đăng kí của parent',
  })
  async findByParentId(@Param('id') parentId: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.transactionService.findByParentId(parentId),
    );
  }
}
