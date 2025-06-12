/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MedicineRequestService } from './medicine-request.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('medicine-request')
export class MedicineRequestController {
  constructor(
    private readonly medicineRequestService: MedicineRequestService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lấy medicine request theo id' })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.medicineRequestService.findById(id),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả medicine request' })
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.medicineRequestService.findAll(),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Tạo yêu cầu gửi thuốc cho học sinh với hình ảnh' })
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        studentId: { type: 'string', description: 'ID của học sinh' },
        note: { type: 'string', description: 'Ghi chú' },
      },
      required: ['image', 'studentId'],
    },
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMedicineRequestDto: CreateMedicineRequestDto,
    @Request() req,
  ) {
    const medicineRequest = await this.medicineRequestService.create(
      file,
      req.user.userId,
      createMedicineRequestDto,
    );
    return new ResponseDTO(
      201,
      true,
      'Medicine request created successfully',
      medicineRequest,
    );
  }

  @Get('today')
  async findToday() {
    return new ResponseDTO(
      200,
      true,
      'Get medicine request today successfully',
      await this.medicineRequestService.getMedicineRequestToday(),
    );
  }

  @Get('parent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async findByParentId(@Request() req) {
    return new ResponseDTO(
      200,
      true,
      'Get medicine requests by parent id successfully',
      await this.medicineRequestService.findByParent(req.user.userId),
    );
  }
}
