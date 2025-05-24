/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import {
  formatToBangkokTime,
  getCurrentTimeInBangkok,
} from 'src/common/utils/date.util';

@Injectable()
export class ChatAiService {
  private readonly openai: OpenAI;
  private readonly systemPrompt: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('AI_API_KEY'),
      baseURL: this.configService.get<string>('AI_BASE_URL'),
    });
    this.systemPrompt =
      this.configService.get<string>('AI_SYSTEM_PROMPT') || '';
    this.model = this.configService.get<string>('AI_MODEL') || '';
  }

  async askQuestion(userId: string, userInput: string): Promise<string> {
    const message1 = this.messageRepo.create({
      user: { id: userId },
      from: 'user',
      content: userInput,
      date: getCurrentTimeInBangkok(),
    });

    await this.messageRepo.save(message1); // ✅ Lưu câu hỏi trước

    let result = '';
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userInput },
        ],
        max_tokens: 700, // ✅ Optional: giới hạn độ dài
      });
      result = completion.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI Error:', error);
      result =
        'Xin lỗi, tôi không thể trả lời câu hỏi lúc này. Vui lòng thử lại sau.';
    }

    const message2 = this.messageRepo.create({
      user: { id: userId },
      content: result,
      from: 'ai',
      date: getCurrentTimeInBangkok(),
    });

    await this.messageRepo.save(message2); // ✅ Lưu câu trả lời

    return result;
  }

  async findByUserId(userId: string) {
    const messages = await this.messageRepo.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
    return messages.map((message) => ({
      ...message,
      date: formatToBangkokTime(message.date),
    }));
  }
}
