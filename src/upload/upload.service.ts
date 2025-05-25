/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from 'src/modules/s3/s3.service';

@Injectable()
export class UploadService {
  constructor(private readonly s3Service: S3Service) {}

  // async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
  //   if (!file) {
  //     throw new BadRequestException('No file uploaded');
  //   }

  //   try {
  //     const fileExtension = file.originalname.split('.').pop();
  //     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  //     const filePath = `images/${fileName}`; // Bỏ userId, chỉ lưu trong images/
  //     const storageRef = storage.bucket().file(filePath);

  //     // Upload file
  //     await storageRef.save(file.buffer, {
  //       metadata: {
  //         contentType: file.mimetype,
  //       },
  //     });
  //     const [exists] = await storageRef.exists();
  //     if (!exists) {
  //       throw new BadRequestException('File does not exist after upload');
  //     }

  //     const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.bucket().name}/o/`;
  //     const encodedPath = encodeURIComponent(filePath)
  //       .replace(/'/g, '%27')
  //       .replace(/"/g, '%22');
  //     const downloadURL = `${baseUrl}${encodedPath}?alt=media`;

  //     return { url: downloadURL };
  //   } catch (error) {
  //     throw new BadRequestException(`Failed to upload image: ${error.message}`);
  //   }
  // }

  async uploadImageToS3(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Tạo tên file duy nhất
    const fileExtension = file.originalname.split('.').pop(); // Lấy phần mở rộng của file
    const fileName = `images/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExtension}`; // Tên file bao gồm timestamp và chuỗi random

    try {
      // Gọi hàm uploadFile từ S3Service
      const fileUrl = await this.s3Service.uploadFile({
        fileBuffer: file.buffer, // Dữ liệu file
        fileName, // Tên file
        contentType: file.mimetype, // Loại file (MIME type)
      });

      return { url: fileUrl }; // Trả về URL file đã upload
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload image to S3: ${error.message}`,
      );
    }
  }
}
