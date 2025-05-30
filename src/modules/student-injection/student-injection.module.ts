import { Module } from '@nestjs/common';
import { StudentInjectionService } from './student-injection.service';
import { StudentInjectionController } from './student-injection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentInjectionEvent } from './entities/student-injection-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentInjectionEvent])],
  controllers: [StudentInjectionController],
  providers: [StudentInjectionService],
})
export class StudentInjectionModule {}
