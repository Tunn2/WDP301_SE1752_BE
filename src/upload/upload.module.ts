import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { S3Service } from 'src/modules/s3/s3.service';

@Module({
  imports: [
    MulterModule.register({
      fileFilter: (req, file, cb) => {
        // Chỉ cho phép hình ảnh
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, S3Service],
  exports: [UploadService],
})
export class UploadModule {}
