import { Module } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ChatAiController } from './chat-ai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  controllers: [ChatAiController],
  providers: [ChatAiService],
})
export class ChatAiModule {}
