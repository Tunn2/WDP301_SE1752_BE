import { Module } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { HealthProfileController } from './health-profile.controller';

@Module({
  controllers: [HealthProfileController],
  providers: [HealthProfileService],
})
export class HealthProfileModule {}
