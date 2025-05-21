import { Module } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { HealthProfileController } from './health-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthProfile } from './entities/health-profile.entity';
import { User } from 'src/user/entities/user.entity';
import { Student } from 'src/student/entities/student.entity';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([HealthProfile, User, Student])],
  controllers: [HealthProfileController],
  providers: [HealthProfileService, JwtStrategy],
})
export class HealthProfileModule {}
