import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';

interface VideoGenerationRequest {
  tenantId: string;
  conversationId: string;
  imageUrl: string;
  prompt: string;
  resolution?: string;
  duration?: string;
  aspectRatio?: string;
  generateAudio?: boolean;
  bitrateMode?: string;
}

@Controller('api/chat')
export class ChatVideoController {
  constructor(private readonly chatService: ChatService) {}

  @Post('video')
  async generateVideo(@Body() body: VideoGenerationRequest) {
    if (
      !body.tenantId ||
      !body.conversationId ||
      !body.imageUrl ||
      !body.prompt
    ) {
      throw new HttpException(
        'Missing required fields: tenantId, conversationId, imageUrl, prompt',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.chatService.submitVideoJob({
        tenantId: body.tenantId,
        conversationId: body.conversationId,
        imageUrl: body.imageUrl,
        prompt: body.prompt,
        resolution: body.resolution || '720p',
        duration: body.duration || 'auto',
        aspectRatio: body.aspectRatio || 'auto',
        generateAudio: body.generateAudio !== false,
        bitrateMode: body.bitrateMode || 'standard',
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate video',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('video/status/:jobId')
  async getVideoStatus(@Param('jobId') jobId: string) {
    const status = this.chatService.getVideoJobStatus(jobId);
    if (!status) {
      throw new HttpException('Video job not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }

  @Post('video/test')
  async testVideo(@Body() body: { sessionId: string }) {
    if (!body.sessionId) {
      throw new HttpException('Missing sessionId', HttpStatus.BAD_REQUEST);
    }

    const testVideos = [
      'https://pub-eae10fe69e894fbfbde5fcfdfdf73ed5.r2.dev/generated-videos/c18e242e-03f5-4bfc-82a0-22fd6a1cb0af.mp4',
      'https://pub-eae10fe69e894fbfbde5fcfdfdf73ed5.r2.dev/generated-videos/aeef9552-bc69-42a0-87e7-f71183b592be.mp4',
      'https://pub-eae10fe69e894fbfbde5fcfdfdf73ed5.r2.dev/generated-videos/e5399593-8999-4cf9-8e49-4f1bdbfeff42.mp4',
    ];

    const videoUrl = testVideos[Math.floor(Math.random() * testVideos.length)];

    const message = await this.chatService.db.mysql.chatMessage.create({
      data: {
        sessionId: body.sessionId,
        sender: 'ai',
        text: 'Video de prueba generado exitosamente!',
        bannerTitle: 'Video de Prueba',
        bannerStyle: 'Video • Fal.ai • R2',
        bannerUrl: null,
      },
    });

    return {
      id: message.id,
      sender: 'ai',
      text: message.text,
      videoUrl,
      thumbnailUrl: null,
      bannerTitle: message.bannerTitle,
      bannerStyle: message.bannerStyle,
      createdAt: message.createdAt,
    };
  }
}
