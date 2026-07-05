import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CombinedAuthGuard } from '../../common/guards/combined-auth.guard';
import { ChatService } from './chat.service';

@Controller('api/tenants/:tenantId/chat-sessions')
@UseGuards(CombinedAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getSessions(@Param('tenantId') tenantId: string, @Req() req: any) {
    const actualTenantId = tenantId === 'default' ? 'DEFAULT_TENANT' : tenantId;
    return this.chatService.getSessions(actualTenantId);
  }

  @Post()
  async createSession(@Param('tenantId') tenantId: string, @Req() req: any, @Body('title') title: string) {
    const actualTenantId = tenantId === 'default' ? 'DEFAULT_TENANT' : tenantId;
    return this.chatService.createSession(actualTenantId, title || 'Nuevo Chat Creativo');
  }

  @Get(':id/messages')
  async getSessionMessages(@Param('id') id: string) {
    return this.chatService.getSessionMessages(id);
  }

  @Post(':id/messages')
  async postMessage(
    @Param('id') id: string,
    @Body('text') text: string,
  ) {
    return this.chatService.postMessage(id, text);
  }

  @Put(':id')
  async updateSession(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.chatService.updateSessionTitle(id, title);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string) {
    return this.chatService.deleteSession(id);
  }

  @Post(':id/approve')
  async approveCampaign(@Param('id') id: string) {
    return this.chatService.approveCampaign(id);
  }
}
