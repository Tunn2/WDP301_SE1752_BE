import { Module } from '@nestjs/common';
import { PostInjectionReportService } from './post-injection-report.service';
import { PostInjectionReportController } from './post-injection-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostInjectionReport } from './entities/post-injection-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostInjectionReport])],
  controllers: [PostInjectionReportController],
  providers: [PostInjectionReportService],
})
export class PostInjectionReportModule {}
