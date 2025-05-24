import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { StudentModule } from './modules/student/student.module';
import { User } from './modules/user/entities/user.entity';
import { HealthProfileModule } from './modules/health-profile/health-profile.module';
import { Student } from './modules/student/entities/student.entity';
import { ParentStudent } from './modules/user/entities/parent-student.entity';
import { HealthProfile } from './modules/health-profile/entities/health-profile.entity';
import { MedicineRequestModule } from './modules/medicine-request/medicine-request.module';
import { UploadModule } from './upload/upload.module';
import { MedicineRequest } from './modules/medicine-request/entities/medicine-request.entity';
import { AccidentModule } from './modules/accident/accident.module';
import { Accident } from './modules/accident/entities/accident.entity';
import { AccidentMedicineModule } from './modules/accident-medicine/accident-medicine.module';
import { AccidentMedicine } from './modules/accident-medicine/entities/accident-medicine.entity';
import { SlotModule } from './modules/slot/slot.module';
import { Slot } from './modules/slot/entities/slot.entity';
import { Medicine } from './modules/medicine/entities/medicine.entity';
import { MedicineModule } from './modules/medicine/medicine.module';
import { ChatAiModule } from './modules/chat-ai/chat-ai.module';
import { Message } from './modules/chat-ai/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // cho phép truy cập từ bất cứ module nào
      envFilePath: '.env', // đường dẫn file env (có thể bỏ nếu là mặc định)
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Student,
          ParentStudent,
          HealthProfile,
          Medicine,
          MedicineRequest,
          Accident,
          AccidentMedicine,
          Slot,
          Message,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    UserModule,
    StudentModule,
    HealthProfileModule,
    MedicineModule,
    MedicineRequestModule,
    UploadModule,
    AccidentModule,
    AccidentMedicineModule,
    SlotModule,
    ChatAiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
