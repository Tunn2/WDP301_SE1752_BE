/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// s3.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3: S3Client;
  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || '',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY') || '',
      },
    });
  }

  getClient(): S3Client {
    return this.s3;
  }

  async uploadFile(params: {
    fileBuffer: Buffer;
    fileName: string;
    contentType: string;
  }): Promise<string> {
    const { fileBuffer, fileName, contentType } = params;

    const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    if (!bucketName) {
      throw new Error('Bucket name is not configured in environment variables');
    }

    const commandInput: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName, // Tên file và đường dẫn trong bucket
      Body: fileBuffer, // Dữ liệu của file
      ContentType: contentType, // Loại file (MIME type)
    };

    try {
      const command = new PutObjectCommand(commandInput);
      await this.s3.send(command);

      // Trả về URL của file đã upload
      return `https://${bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }
}
