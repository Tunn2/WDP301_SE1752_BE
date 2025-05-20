import { Controller } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';

@Controller('health-profile')
export class HealthProfileController {
  constructor(private readonly healthProfileService: HealthProfileService) {}
}
