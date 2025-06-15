/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccidentService } from './accident.service';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('accident')
export class AccidentController {
  constructor(private readonly accidentService: AccidentService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo sự cố cho học sinh',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async create(@Request() req, @Body() createAccidentDto: CreateAccidentDto) {
    const accident = await this.accidentService.create(
      req.user.userId,
      createAccidentDto,
    );

    return new ResponseDTO(201, true, 'Create accident successfully', accident);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy tất cả sự cố',
  })
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Get accidents successfully',
      await this.accidentService.findAll(),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy sự cố theo id',
  })
  async findById(@Param('id') id: string) {
    return new ResponseDTO(
      200,
      true,
      'Get accident by id successfully',
      await this.accidentService.findById(id),
    );
  }
}
