/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SlotService } from './slot.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  // @Post('import')
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiConsumes('multipart/form-data')
  // @ApiOperation({
  //   summary: 'Import slot từ file Excel',
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // async importExcel(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) {
  //     return new ResponseDTO(400, false, 'Không có file được gửi lên', null);
  //   }
  //   await this.slotService.importFromExcel(file.buffer);
  //   return new ResponseDTO(201, true, 'Import slot successfully', null);
  // }

  @Get('today')
  @ApiQuery({
    name: 'session',
    type: 'string',
    required: false,
    enum: ['Sáng', 'Trưa', 'Chiều'],
    description: 'Filter by session',
    example: 'Sáng',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Nurse get slot được assign ngày hôm nay',
  })
  async findByStatus(
    @Query('session') session: string = 'Sáng',
    @Request() req,
  ) {
    return new ResponseDTO(
      200,
      true,
      'Get slots successfully',
      await this.slotService.findToday(session, req.user.userId),
    );
  }

  //when check, client send slot id and an image, fix below code
  @Patch(':id/check')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Check slot with image',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async checkSlot(
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (!image) {
      return new ResponseDTO(400, false, 'No image uploaded', null);
    }
    await this.slotService.checkSlot(id, image);
    return new ResponseDTO(200, true, 'Check slot successfully', null);
  }
}
