/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccidentService } from './accident.service';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('accident')
export class AccidentController {
  constructor(private readonly accidentService: AccidentService) {}

  @Post()
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
  async findAll() {
    return new ResponseDTO(
      200,
      true,
      'Get accidents successfully',
      await this.accidentService.findAll(),
    );
  }
}
