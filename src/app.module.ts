/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { InjectionEventModule } from './modules/injection-event/injection-event.module';
import { HealthEventModule } from './modules/health-event/health-event.module';
import { HealthEvent } from './modules/health-event/entities/health-event.entity';
import { HealthEventStudent } from './modules/health-event/entities/health-event-student.entity';
import { InjectionEvent } from './modules/injection-event/entities/injection-event.entity';
import { VaccinationModule } from './modules/vaccination/vaccination.module';
import { Vaccination } from './modules/vaccination/entities/vaccine.entity';
import { StudentVaccination } from './modules/vaccination/entities/student-vaccination.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PaymentModule } from './modules/payment/payment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { Transaction } from './modules/transaction/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: { from: '"MedixCampus" <cr7@gmail.com>' },
        template: {
          dir: process.cwd() + '/src/modules/injection-event/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
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
        logging: true,
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
          HealthEvent,
          HealthEventStudent,
          InjectionEvent,
          Vaccination,
          StudentVaccination,
          Transaction,
        ],
        synchronize: true,
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
    InjectionEventModule,
    HealthEventModule,
    VaccinationModule,
    PaymentModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
