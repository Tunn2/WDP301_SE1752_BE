/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectionRecordService } from './injection-record.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('injection-record')
export class InjectionRecordController {
  constructor(
    private readonly injectionRecordService: InjectionRecordService,
  ) {}

  @Get()
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.injectionRecordService.findAll(),
    );
  }

  @Get(':id/students')
  @ApiOperation({
    summary:
      'Danh sách học sinh đã đăng kí thành công của sự kiện đó, nhưng chưa tiêm',
  })
  async findStudentRegisterByInjectionEventId(
    @Param('id') injectionEventId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.injectionRecordService.findStudentsByInjectionEventId(
        injectionEventId,
      );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
    res.send(buffer);
  }

  @Get('student/:id')
  async findByStudentId(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.injectionRecordService.findByStudentId(id),
    );
  }

  @Post('injection-event/:id/result')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import result từ file Excel',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') injectionEventId: string,
  ) {
    if (!file) {
      return new ResponseDTO(400, false, 'Không có file được gửi lên', null);
    }
    await this.injectionRecordService.updateResult(
      file.buffer,
      injectionEventId,
    );
    return new ResponseDTO(201, true, 'Import result successfully', null);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy record bằng id',
  })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.injectionRecordService.findById(id),
    );
  }
}
