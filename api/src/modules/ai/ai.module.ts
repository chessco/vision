import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { FalService } from './fal.service';

@Module({
  providers: [AgentService, FalService],
  exports: [AgentService, FalService],
})
export class AiModule {}
