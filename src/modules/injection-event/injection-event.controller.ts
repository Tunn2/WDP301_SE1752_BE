/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectionEventService } from './injection-event.service';
import { CreateInjectionEventDto } from './dto/create-injection-event.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('injection-event')
export class InjectionEventController {
  constructor(private readonly injectionEventService: InjectionEventService) {}

  @Post()
  async create(@Body() request: CreateInjectionEventDto) {
    await this.injectionEventService.create(request);
    return new ResponseDTO(
      201,
      true,
      'Create injection event successfully',
      null,
    );
  }

  @Get('available')
  async findAvailable() {
    return new ResponseDTO(
      201,
      true,
      'Get available injection event',
      await this.injectionEventService.findAvailableInjectionEvents(),
    );
  }

  @Get(':id/students')
  async findStudentRegisterByInjectionEventId(
    @Param('id') injectionEventId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.injectionEventService.findStudentRegisterdByInjectionEventId(
        injectionEventId,
      );

    // Thiết lập header cho file Excel
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
    res.send(buffer);
  }

  @Post(':id/attendance')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import danh sách tiêm',
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
  async markAttendance(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return new ResponseDTO(400, false, 'Không có file được gửi lên', null);
    }
    await this.injectionEventService.markAttendance(file.buffer);
    return new ResponseDTO(200, true, 'Điểm danh thành công', null);
  }
}
