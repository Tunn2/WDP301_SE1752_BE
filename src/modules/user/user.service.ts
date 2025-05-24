/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Student } from 'src/modules/student/entities/student.entity';
import { ParentStudent } from './entities/parent-student.entity';
import { ParentType } from 'src/common/enums/parent-type.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
  ) {}

  async findAll(page: string, limit: string) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    // Đảm bảo page và limit không âm
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(limitNum, 100)); // Giới hạn tối đa limit để tránh tải quá nhiều

    // Tính số bản ghi cần bỏ qua (skip)
    const skip = (validPage - 1) * validLimit;

    // Truy vấn với phân trang
    const [users, total] = await this.userRepo.findAndCount({
      skip,
      take: validLimit,
    });

    return {
      users,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
      },
    };
  }

  async findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<any> {
    return await this.userRepo.findOne({ where: { phone } });
  }

  async importFromExcel(fileBuffer: Buffer): Promise<string> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const members = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

    const createdPhones = new Set<string>();
    let accountCount = 0;
    let relationCount = 0;

    for (const member of members) {
      const studentCode = String(member['MSHS'] || '').trim();
      if (!studentCode) continue;

      // Tìm hoặc tạo student
      let student = await this.studentRepo.findOne({ where: { studentCode } });
      if (!student) {
        student = this.studentRepo.create({
          studentCode,
          fullName: member['Họ tên'] || 'Không rõ',
          address: member['Địa chỉ'] || '',
        });
        await this.studentRepo.save(student);
      }

      // Danh sách các mối quan hệ phụ huynh
      const roles = [
        {
          label: 'SĐT ba',
          role: UserRole.PARENT,
          fullName: member['Họ tên ba'],
          email: member['Email ba'],
          relationship: ParentType.FATHER,
        },
        {
          label: 'SĐT mẹ',
          role: UserRole.PARENT,
          fullName: member['Họ tên mẹ'],
          email: member['Email mẹ'],
          relationship: ParentType.MOTHER,
        },
        {
          label: 'SĐT người giám hộ',
          role: UserRole.PARENT,
          fullName: member['Họ tên người giám hộ'],
          email: member['Email người giám hộ'],
          relationship: ParentType.GUARDIAN,
        },
      ];

      for (const r of roles) {
        const phone = String(member[r.label] || '').trim();
        if (!phone) continue;

        let user = await this.userRepo.findOne({ where: { phone } });

        if (!user) {
          user = this.userRepo.create({
            phone: phone,
            password: '12345',
            fullName: r.fullName || 'Không rõ',
            email: r.email || '',
            role: r.role,
          });
          await this.userRepo.save(user);
          createdPhones.add(phone);
          accountCount++;
        }

        // Tạo quan hệ student-user nếu chưa có
        const existingRelation = await this.parentStudentRepo.findOne({
          where: {
            user: { id: user.id },
            student: { id: student.id },
          },
        });

        if (!existingRelation) {
          await this.parentStudentRepo.save({
            user,
            student,
            relationship: r.relationship,
          });
          relationCount++;
        }
      }
    }

    return `✅ Đã import thành công ${accountCount} tài khoản phụ huynh và ${relationCount} mối quan hệ học sinh - phụ huynh từ ${members.length} dòng dữ liệu.`;
  }
}
