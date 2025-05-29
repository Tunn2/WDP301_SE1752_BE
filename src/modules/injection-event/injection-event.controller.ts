import { Body, Controller, Post } from '@nestjs/common';
import { InjectionEventService } from './injection-event.service';
import { CreateInjectionEventDto } from './dto/create-health-event.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';

@Controller('injection-event')
export class InjectionEventController {
  constructor(private readonly injectionEventService: InjectionEventService) {}

  @Post()
  async create(@Body() request: CreateInjectionEventDto) {
    await this.injectionEventService.create(request);
    return new ResponseDTO(
      201,
      true,
      'Create injection event successfully',
      null,
    );
  }
}
