/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineRequest } from './entities/medicine-request.entity';
import { Between, In, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { CreateMedicineRequestDto } from './dto/create-medicine-request.dto';
import { ParentStudent } from 'src/modules/user/entities/parent-student.entity';
import {
  formatToVietnamTime,
  getCurrentTimeInVietnam,
  getEndOfTodayInVietnam,
  getStartOfTodayInVietnam,
} from 'src/common/utils/date.util';
import { Slot } from '../slot/entities/slot.entity';
import { MedicineRequestStatus } from 'src/common/enums/medicine-request.enum';
import { createWorker } from 'tesseract.js';
import { ConfigService } from '@nestjs/config/dist/config.service';
import OpenAI from 'openai';
import { SlotMedicine } from '../slot/entities/slot-medicine.entity';

@Injectable()
export class MedicineRequestService {
  private readonly openai: OpenAI;
  private readonly systemPrompt: string;
  private readonly model: string;
  constructor(
    @InjectRepository(MedicineRequest)
    private medicineRequestRepo: Repository<MedicineRequest>,
    @InjectRepository(ParentStudent)
    private parentStudentRepo: Repository<ParentStudent>,
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
    @InjectRepository(SlotMedicine)
    private slotMedicineRepo: Repository<SlotMedicine>,
    private uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('AI_API_KEY'),
      baseURL: this.configService.get<string>('AI_BASE_URL'),
    });
    this.systemPrompt =
      "Bạn là một trợ lý AI tiếng Việt hỗ trợ phân tích toa thuốc. Nhiệm vụ của bạn là trả về thông tin dưới dạng mảng JSON (array of objects) với cấu trúc sau: mỗi đối tượng đại diện cho một buổi uống thuốc trong ngày và có các trường 'session' (tên buổi, ví dụ: 'Sáng' hoặc 'Chiều'), 'medicines' (mảng các đối tượng, mỗi đối tượng chứa 'name' là tên thuốc và 'quantity' là số viên uống trong buổi đó). \n" +
      "QUAN TRỌNG: Chỉ trả về thông tin cho buổi Sáng và buổi Chiều. Nếu không có thuốc nào trong một buổi, để mảng 'medicines' là rỗng ([]). Chỉ trả về mảng JSON, không thêm bất kỳ văn bản giải thích nào trước hoặc sau mảng JSON. Đảm bảo định dạng JSON hợp lệ để có thể parse bằng JSON.parse(). Ví dụ: \n" +
      '[\n  {"session": "Sáng", "medicines": [{"name": "Paracetamol 500mg", "quantity": 1}, {"name": "Amoxicillin 250mg", "quantity": 2}]},\n  {"session": "Chiều", "medicines": [{"name": "Paracetamol 500mg", "quantity": 1}]}\n]\n' +
      'Nếu không thể phân tích toa thuốc, trả về mảng rỗng: [].';
    this.model = this.configService.get<string>('AI_MODEL') || '';
  }

  //I want to upload an image and get the medicine request information from it
  async uploadImageAndGetSlots(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    //upload image to S3
    const uploadResult = await this.uploadService.uploadImageToS3(file);
    const imageUrl = uploadResult.url;

    // Extract text from image using Tesseract.js
    const extractedText = await this.extractTextFromImage(imageUrl);
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: this.systemPrompt },
        {
          role: 'user',
          content: `Hãy phân tích toa thuốc sau và trả về thông tin dưới dạng mảng JSON chứa danh sách các loại thuốc với tên thuốc và liều lượng các buổi trong ngày (sáng, trưa, chiều, tối). Chỉ trả về JSON, không giải thích:\n\n${extractedText}`,
        },
      ],
    });

    const responseContent = completion.choices[0].message.content;

    // Loại bỏ các ký tự không mong muốn hoặc văn bản ngoài JSON nếu có
    const jsonMatch = responseContent && responseContent.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseContent || '';
    const parsedResult = JSON.parse(jsonString);
    console.log('Dữ liệu JSON đã parse:', parsedResult);

    return { imageUrl, parsedResult };
  }

  async findAll() {
    return this.medicineRequestRepo.find({
      relations: ['student', 'parent'],
      order: { date: 'DESC' },
    });
  }

  async findById(id: string) {
    return this.medicineRequestRepo.findOne({
      where: { id },
      relations: ['student', 'parent', 'slots'],
    });
  }

  async approveMedicineRequest(id: string) {
    const medicineRequest = await this.medicineRequestRepo.findOne({
      where: { id },
    });

    if (!medicineRequest) {
      throw new BadRequestException('Medicine request not found');
    }
    medicineRequest.status = MedicineRequestStatus.APPROVED;
    await this.medicineRequestRepo.save(medicineRequest);
  }
  async rejectMedicineRequest(id: string) {
    const medicineRequest = await this.medicineRequestRepo.findOne({
      where: { id },
    });

    if (!medicineRequest) {
      throw new BadRequestException('Medicine request not found');
    }
    medicineRequest.status = MedicineRequestStatus.REJECTED;
    await this.medicineRequestRepo.save(medicineRequest);
  }

  async create(userId: string, request: CreateMedicineRequestDto) {
    try {
      // Kiểm tra xem học sinh đã có yêu cầu thuốc trong ngày chưa
      const foundMedicineRequest = await this.medicineRequestRepo.findOne({
        where: {
          student: { id: request.studentId },
          date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
        },
        relations: ['student'],
      });

      if (foundMedicineRequest)
        throw new BadRequestException(
          'This student already had a medicine request today',
        );

      // Kiểm tra xem người dùng có phải là phụ huynh của học sinh không
      const checkValid = await this.parentStudentRepo.findOne({
        where: { student: { id: request.studentId }, user: { id: userId } },
        relations: ['student'],
      });

      const classroom = checkValid?.student.class;
      let nurseId = 20;
      console.log(classroom?.charAt(0));
      if (
        Number(classroom?.charAt(0)) >= 1 &&
        Number(classroom?.charAt(0)) <= 3
      ) {
        nurseId = 19;
      }

      if (!checkValid) {
        throw new BadRequestException(
          'This user is not parent of this student',
        );
      }

      // Tạo medicineRequest
      const medicineRequest = this.medicineRequestRepo.create({
        image: request.imageUrl,
        student: { id: request.studentId },
        parent: { id: userId },
        note: request.note,
        date: getCurrentTimeInVietnam(),
      });

      // Lưu medicineRequest trước để có ID
      const savedMedicineRequest =
        await this.medicineRequestRepo.save(medicineRequest);
      if (!savedMedicineRequest) {
        throw new Error('Không thể lưu medicineRequest vào cơ sở dữ liệu');
      }

      // Tạo các slot và slot medicine
      const slots: Slot[] = [];

      for (const slotRequest of request.slots) {
        const slot = this.slotRepo.create({
          session: slotRequest.session,
          medicineRequest: savedMedicineRequest, // Liên kết với medicineRequest đã lưu
          nurse: { id: nurseId.toString() },
        });

        // Lưu slot vào cơ sở dữ liệu
        const savedSlot = await this.slotRepo.save(slot);
        if (!savedSlot) {
          throw new Error('Không thể lưu slot vào cơ sở dữ liệu');
        }

        // Tạo và lưu các slot medicine
        const medicines: SlotMedicine[] = slotRequest.medicines.map((med) =>
          this.slotMedicineRepo.create({
            name: med.name,
            description: med.description,
            quantity: med.quantity,
            slot: savedSlot, // Liên kết với slot đã lưu
          }),
        );

        // Lưu tất cả slotMedicines vào cơ sở dữ liệu
        let savedMedicines;
        try {
          savedMedicines = await this.slotMedicineRepo.save(medicines);
          if (!savedMedicines || savedMedicines.length !== medicines.length) {
            throw new Error('Không thể lưu slotMedicines vào cơ sở dữ liệu');
          }
        } catch (error) {
          console.log(error.message);
        }

        savedSlot.medicines = savedMedicines;
        slots.push(savedSlot); // Đẩy savedSlot vào mảng slots
      }

      // Cập nhật medicineRequest với slots
      savedMedicineRequest.slots = slots;

      // Lưu lại medicineRequest để đảm bảo mối quan hệ được cập nhật
      const finalMedicineRequest =
        await this.medicineRequestRepo.save(savedMedicineRequest);
      return finalMedicineRequest; // Trả về đối tượng đã lưu
    } catch (error) {
      console.log(error.message);
    }
  }

  async getMedicineRequestToday() {
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
      },
      relations: ['student', 'parent'],
    });

    return medicineRequests.map((req) => ({
      ...req,
      date: formatToVietnamTime(req.date),
    }));
  }

  async findByParent(parentId: string) {
    const medicineRequests = await this.medicineRequestRepo.find({
      where: { parent: { id: parentId } },
      relations: ['parent', 'student'],
      order: { date: 'DESC' },
    });
    return medicineRequests.map((req) => ({
      ...req,
      date: formatToVietnamTime(req.date),
    }));
  }

  async getClassesToday() {
    // Lấy tất cả medicine requests hôm nay
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
      },
      relations: ['student', 'slots', 'slots.nurse'],
    });

    if (medicineRequests.length === 0) {
      throw new BadRequestException('No medicine requests found for today');
    }

    // Lọc ra những medicine requests chưa có nurse được assign
    const unassignedMedicineRequests = medicineRequests.filter((req) => {
      // Kiểm tra xem có slot nào chưa được assign nurse không
      return req.slots.some((slot) => !slot.nurse || !slot.nurse.id);
    });

    if (unassignedMedicineRequests.length === 0) {
      return []; // Hoặc throw exception nếu muốn
    }

    // Lấy danh sách các class chưa được assign
    const unassignedClasses = unassignedMedicineRequests.map(
      (req) => req.student.class,
    );

    // Loại bỏ duplicate classes
    return [...new Set(unassignedClasses)];
  }

  async assignNurseToClass(classes: string[], nurseId: string) {
    // Validation đầu vào
    if (!classes || classes.length === 0) {
      throw new BadRequestException('No classes provided');
    }
    if (!nurseId) {
      throw new BadRequestException('Nurse ID is required');
    }
    const medicineRequests = await this.medicineRequestRepo.find({
      where: {
        date: Between(getStartOfTodayInVietnam(), getEndOfTodayInVietnam()),
        student: { class: In(classes) },
      },
      relations: ['student', 'slots', 'slots.nurse'],
    });

    if (medicineRequests.length === 0) {
      throw new BadRequestException(
        'No medicine requests found for the provided classes today',
      );
    }
    const unassignedSlots: Slot[] = [];
    medicineRequests.forEach((req) => {
      req.slots.forEach((slot) => {
        if (!slot.nurse || !slot.nurse.id) {
          unassignedSlots.push(slot);
        }
      });
    });

    if (unassignedSlots.length === 0) {
      throw new BadRequestException(
        'All slots for the provided classes are already assigned',
      );
    }

    return await this.medicineRequestRepo.manager.transaction(
      async (manager) => {
        const slotRepo = manager.getRepository(Slot);
        const updatePromises = unassignedSlots.map((slot) =>
          slotRepo.save({
            ...slot,
            nurse: { id: nurseId },
          }),
        );
        await Promise.all(updatePromises);
        return {
          message: `Successfully assigned nurse to ${unassignedSlots.length} slots across ${classes.length} classes`,
          assignedSlots: unassignedSlots.length,
          classes: classes,
        };
      },
    );
  }

  private async extractTextFromImage(url: string): Promise<string> {
    const worker = await createWorker('vie'); // Ngôn ngữ tiếng Việt
    try {
      const {
        data: { text },
      } = await worker.recognize(url);
      return text;
    } catch (error) {
      console.error('Lỗi khi trích xuất văn bản từ hình ảnh:', error.message);
      throw error;
    } finally {
      await worker.terminate();
    }
  }
}
