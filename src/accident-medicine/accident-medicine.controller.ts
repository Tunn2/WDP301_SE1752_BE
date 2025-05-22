import { Body, Controller, Post } from '@nestjs/common';
import { AccidentMedicineService } from './accident-medicine.service';
import { CreateAccidentMedicineDto } from './dto/create-accident-medicine.dto';
import { ApiBody } from '@nestjs/swagger';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('accident-medicine')
export class AccidentMedicineController {
  constructor(
    private readonly accidentMedicineService: AccidentMedicineService,
  ) {}

  @Post()
  @ApiBody({ type: CreateAccidentMedicineDto })
  async create(@Body() request: CreateAccidentMedicineDto) {
    await this.accidentMedicineService.create(request);
    return new ResponseDTO(201, true, 'Successfully', null);
  }
}
