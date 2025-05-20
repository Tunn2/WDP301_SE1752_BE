import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { StudentModule } from './student/student.module';
import { User } from './user/entities/user.entity';
import { HealthProfileModule } from './health-profile/health-profile.module';
import { Student } from './student/entities/student.entity';
import { ParentStudent } from './user/entities/parent-student.entity';

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
        entities: [User, Student, ParentStudent],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    UserModule,
    StudentModule,
    HealthProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
