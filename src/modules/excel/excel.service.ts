/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  async exportToExcel(data: any[]): Promise<Buffer> {
    // Tạo workbook và worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Xuất workbook thành buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  }
}
