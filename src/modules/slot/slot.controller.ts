import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SlotService } from './slot.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import slot từ file Excel',
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
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return new ResponseDTO(400, false, 'Không có file được gửi lên', null);
    }
    await this.slotService.importFromExcel(file.buffer);
    return new ResponseDTO(201, true, 'Import slot successfully', null);
  }
}
