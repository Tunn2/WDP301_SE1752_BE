/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectionRecord } from './entities/injection-record.entity';
import { Repository, DataSource } from 'typeorm';
import { Student } from '../student/entities/student.entity';
import { ExcelService } from '../excel/excel.service';
import * as XLSX from 'xlsx';

@Injectable()
export class InjectionRecordService {
  constructor(
    @InjectRepository(InjectionRecord)
    private injectionRecordRepo: Repository<InjectionRecord>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    private readonly excelService: ExcelService,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.injectionRecordRepo.find({
      order: { registrationDate: 'DESC' },
    });
  }

  async findById(id: string) {
    return await this.injectionRecordRepo.findOne({
      where: { id },
      relations: ['student', 'injectionEvent'],
    });
  }

  async findByStudentId(studentId: string) {
    const foundStudent = await this.studentRepo.find({
      where: { id: studentId },
    });
    if (!foundStudent) throw new BadGatewayException('Student not found');

    const injectionRecords = await this.injectionRecordRepo.find({
      where: { student: { id: studentId } },
      relations: ['injectionEvent'],
      order: { registrationDate: 'DESC' },
    });
    return injectionRecords;
  }

  async findStudentsByInjectionEventId(injectionEventId: string) {
    const foundInjectionRecords = await this.injectionRecordRepo.find({
      where: { injectionEvent: { id: injectionEventId } },
      order: { student: { class: 'ASC' } },
      relations: ['student'],
    });

    const data = foundInjectionRecords.map((record) => ({
      studentCode: record.student.studentCode,
      studentName: record.student.fullName,
      classroom: record.student.class,
      gender: record.student.gender,
      injectionStatus: null,
      preInjectionTemperature: record.preInjectionTemperature,
      hasPreExistingConditions: record.hasPreExistingConditions,
      preExistingConditions: record.preExistingConditions,
      eligibleForInjection: record.eligibleForInjection,
      deferralReason: record.deferralReason,
      injectionSite: record.injectionSite,
      healthStatus: record.healthStatus,
      postInjectionTemperature: record.postInjectionTemperature,
      sideEffect: record.sideEffects,
      notes: record.notes,
      registrationDate: record.registrationDate,
    }));
    return this.excelService.exportToExcel(data);
  }

  async updateResult(fileBuffer: Buffer, injectionEventId: string) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const row of rows) {
        const foundInjectionRecord = await this.injectionRecordRepo.findOne({
          where: {
            injectionEvent: { id: injectionEventId },
            student: { studentCode: row['studentCode'] },
          },
        });

        if (!foundInjectionRecord) {
          console.log(
            `Injection record not found for student: ${row['studentCode']}`,
          );
          continue; // Skip thay vì throw error
        }

        // Update với proper type conversion
        if (row['injectionStatus']) {
          foundInjectionRecord.injectionStatus = row['injectionStatus'];
        }

        if (row['injectionSite']) {
          foundInjectionRecord.injectionSite = row['injectionSite'];
        }

        if (row['deferralReason']) {
          foundInjectionRecord.deferralReason = row['deferralReason'];
        }

        // Boolean conversion
        if (row['eligibleForInjection'] !== undefined) {
          foundInjectionRecord.eligibleForInjection =
            row['eligibleForInjection'] === 'True' ||
            row['eligibleForInjection'] === true;
        }

        if (row['hasPreExistingConditions'] !== undefined) {
          foundInjectionRecord.hasPreExistingConditions =
            row['hasPreExistingConditions'] === 'True' ||
            row['hasPreExistingConditions'] === true;
        }

        if (row['healthStatus']) {
          foundInjectionRecord.healthStatus = row['healthStatus'];
        }

        if (row['notes']) {
          foundInjectionRecord.notes = row['notes'];
        }
        if (row['postInjectionTemperature']) {
          foundInjectionRecord.postInjectionTemperature = parseFloat(
            row['postInjectionTemperature'],
          );
        }

        if (row['preInjectionTemperature']) {
          foundInjectionRecord.preInjectionTemperature = parseFloat(
            row['preInjectionTemperature'],
          );
        }

        if (row['preExistingConditions']) {
          foundInjectionRecord.preExistingConditions =
            row['preExistingConditions'];
        }

        if (row['sideEffects']) {
          foundInjectionRecord.sideEffects = row['sideEffect'];
        }

        await this.injectionRecordRepo.save(foundInjectionRecord);
        console.log(`Updated record for student: ${row['studentCode']}`);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error updating injection records:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to update records: ${error.message}`,
      );
    }
  }

  async updateById() {}
}
