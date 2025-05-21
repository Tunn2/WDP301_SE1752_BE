/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { storage } from 'src/configs/firebase.config';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      const filePath = `images/${fileName}`; // Bỏ userId, chỉ lưu trong images/
      const storageRef = storage.bucket().file(filePath);

      // Upload file
      await storageRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      const [exists] = await storageRef.exists();
      if (!exists) {
        throw new BadRequestException('File does not exist after upload');
      }

      const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.bucket().name}/o/`;
      const encodedPath = encodeURIComponent(filePath)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      const downloadURL = `${baseUrl}${encodedPath}?alt=media`;

      return { url: downloadURL };
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }
}
