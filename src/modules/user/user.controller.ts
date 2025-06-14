/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('nurse')
  async findNurses() {
    return new ResponseDTO(
      200,
      true,
      'Get nurses successfully',
      await this.userService.findNurses(),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Trang hiện tại (mặc định là 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Giới hạn dữ liệu (mặc định là 20)',
    type: Number,
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const users = await this.userService.findAll(page, limit);
    return new ResponseDTO(200, true, 'Get users successfully', users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Get users successfully',
      await this.userService.findOne(id),
    );
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import học sinh và tài khoản phụ huynh từ file Excel',
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
  @ApiResponse({ status: 200, description: 'Import thành công' })
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return new ResponseDTO(400, false, 'Không có file được gửi lên', null);
    }
    const message = await this.userService.importFromExcel(file.buffer);
    return new ResponseDTO(201, true, message, null);
  }
}
