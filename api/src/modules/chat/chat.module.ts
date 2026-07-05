import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';
import { ChatVideoController } from './chat-video.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ChatController, ChatVideoController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
