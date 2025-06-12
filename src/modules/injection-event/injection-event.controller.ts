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
  @ApiOperation({
    summary: 'Tạo sự kiện tiêm chủng tại trường',
  })
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
  @ApiOperation({
    summary: 'Lấy những sự kiện tiêm chủng đang trong thời hạn có thể đăng kí',
  })
  async findAvailable() {
    return new ResponseDTO(
      201,
      true,
      'Get available injection event',
      await this.injectionEventService.findAvailableInjectionEvents(),
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

  @Get(':id/students/injected')
  @ApiOperation({
    summary: 'Danh sách học sinh đã tiêm của sự kiện đó',
  })
  async findStudentHaveInjectedByInjectionEventId(
    @Param('id') injectionEventId: string,
  ) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.injectionEventService.findStudentHaveInjectedByInjectionEventId(
        injectionEventId,
      ),
    );
  }

  @Get(':id/students/not-injected')
  @ApiOperation({
    summary: 'Danh sách học sinh không đến tiêm của sự kiện đó',
  })
  async findStudentNotInjectedByInjectionEventId(
    @Param('id') injectionEventId: string,
  ) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.injectionEventService.findStudentNotInjectedByInjectionEventId(
        injectionEventId,
      ),
    );
  }

  @Post(':id/attendance')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import file kết quả sau khi tiêm',
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
