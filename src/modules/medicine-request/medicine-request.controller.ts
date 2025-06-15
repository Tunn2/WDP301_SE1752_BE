/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { AssignNurseToClassDto } from './dto/assign-nurse-to-class.dto';

@Controller('medicine-request')
export class MedicineRequestController {
  constructor(
    private readonly medicineRequestService: MedicineRequestService,
  ) {}

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

  @Get('class')
  @ApiOperation({ summary: 'Lấy tất cả lớp có yêu cầu gửi thuốc hôm nay' })
  async getClassesToday() {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.medicineRequestService.getClassesToday(),
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
  @ApiOperation({
    summary: 'Xem những yêu cầu gửi thuốc hôm nay',
  })
  async findToday() {
    console.log('Fetching medicine requests for today');
    return new ResponseDTO(
      200,
      true,
      'Get medicine request today successfully',
      await this.medicineRequestService.getMedicineRequestToday(),
    );
  }

  @Get('parent')
  @ApiOperation({
    summary: 'Lấy tất cả medicine request của phụ huynh',
  })
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

  @Patch(':id')
  async aproveMedicineRequest(@Param('id') id: string) {
    await this.medicineRequestService.approveMedicineRequest(id);
    return new ResponseDTO(
      200,
      true,
      'Medicine request approved successfully',
      null,
    );
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Gán y tá cho lớp học trong yêu cầu gửi thuốc',
  })
  async assignNurseToMedicineRequest(@Body() body: AssignNurseToClassDto) {
    return new ResponseDTO(
      200,
      true,
      'Assign nurse to medicine request successfully',
      await this.medicineRequestService.assignNurseToClass(
        body.classes,
        body.nurseId,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy medicine request theo id',
  })
  @ApiOperation({ summary: 'Lấy medicine request theo id' })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Successfully',
      await this.medicineRequestService.findById(id),
    );
  }
}
