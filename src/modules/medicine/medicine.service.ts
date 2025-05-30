/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
  ) {}

  async importFromExcel(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

    const medicines = rows.map((row) => {
      const quantity =
        row['Số lượng hộp'] * row['Số lượng vỉ/hộp'] * row['Số lượng thuốc/vỉ'];
      return {
        name: row['Tên'],
        manufacturer: row['Nhà sản xuất'],
        description: row['Công dụng'],
        type: row['Loại'],
        quantity,
      };
    });

    await this.medicineRepo.save(medicines);
    return 'Import medicines successfully';
  }
}
