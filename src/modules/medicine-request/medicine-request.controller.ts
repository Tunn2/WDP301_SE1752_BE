/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
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
  @ApiOperation({ summary: 'Tạo yêu cầu gửi thuốc cho học sinh với hình ảnh' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createMedicineRequestDto: CreateMedicineRequestDto,
    @Request() req,
  ) {
    const medicineRequest = await this.medicineRequestService.create(
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

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
      required: ['image'],
    },
  })
  @ApiOperation({
    summary: 'Tạo yêu cầu gửi thuốc cho học sinh với hình ảnh',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const { imageUrl, parsedResult } =
      await this.medicineRequestService.uploadImageAndGetSlots(file);
    return new ResponseDTO(201, true, 'Medicine request created successfully', {
      imageUrl,
      slots: parsedResult,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Duyệt yêu cầu gửi thuốc',
  })
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

  @Delete(':id')
  @ApiOperation({
    summary: 'Từ chối cầu gửi thuốc',
  })
  async deleteMedicineRequest(@Param('id') id: string) {
    await this.medicineRequestService.rejectMedicineRequest(id);
    return new ResponseDTO(
      200,
      true,
      'Medicine request rejected successfully',
      null,
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
