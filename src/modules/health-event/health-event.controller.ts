/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HealthEventService } from './health-event.service';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateHealthEventDto } from './dto/create-health-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('health-event')
export class HealthEventController {
  constructor(private readonly healthEventService: HealthEventService) {}

  @Post()
  async create(@Body() request: CreateHealthEventDto) {
    console.log('siu');
    if (typeof request.date === 'string') {
      request.date = new Date(request.date);
    }
    console.log('siu1');
    await this.healthEventService.create(request);
    return new ResponseDTO(201, true, 'Create health event successfully', null);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'nurse')
  @ApiBearerAuth('JWT-auth')
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
  async importResult(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      return new ResponseDTO(400, false, 'Không có file được gửi lên', null);
    }
    await this.healthEventService.importResultFromExcel(
      file.buffer,
      req.user.userId,
    );
    return new ResponseDTO(
      201,
      true,
      'Import health event result successfully',
      null,
    );
  }
}
