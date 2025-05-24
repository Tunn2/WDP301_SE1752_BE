/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ResponseDTO } from 'src/common/response-dto/response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat-ai')
export class ChatAiController {
  constructor(private readonly chatAiService: ChatAiService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async ask(@Request() req, @Body() request: CreateMessageDto) {
    const output = await this.chatAiService.askQuestion(
      req.user.userId,
      request.content,
    );
    return new ResponseDTO(201, true, 'Successfully', output);
  }
}
