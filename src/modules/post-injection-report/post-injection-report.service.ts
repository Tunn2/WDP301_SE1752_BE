import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostInjectionReport } from './entities/post-injection-report.entity';
import { Repository } from 'typeorm';
import { CreatePostInjectionReportDto } from './dto/create-post-injection-report.dto';
import { getCurrentTimeInVietnam } from 'src/common/utils/date.util';

@Injectable()
export class PostInjectionReportService {
  constructor(
    @InjectRepository(PostInjectionReport)
    private reportRepo: Repository<PostInjectionReport>,
  ) {}
  async create(request: CreatePostInjectionReportDto, userId: string) {
    const injectionReport = this.reportRepo.create({
      injectionRecord: { id: request.injectionRecordId },
      createdBy: { id: userId },
      description: request.description,
      severityLevel: request.severity,
      hoursPostInjection: request.hoursPostInjection,
      temperature: request.temperature,
      createdAt: getCurrentTimeInVietnam(),
    });
    await this.reportRepo.save(injectionReport);
  }

  async findByInjectionRecordId(injectionRecordId: string) {
    return await this.reportRepo.find({
      where: { injectionRecord: { id: injectionRecordId } },
      relations: ['createdBy', 'injectionRecord'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    return await this.reportRepo.findOne({ where: { id } });
  }

  async findByInjectionEvent(injectionEventId: string) {
    return await this.reportRepo.find({
      where: { injectionRecord: { injectionEvent: { id: injectionEventId } } },
      relations: ['createdBy', 'injectionRecord'],
      order: { createdAt: 'DESC' },
    });
  }
}
