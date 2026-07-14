import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class AgentClient extends PitayaCoreBaseClient {
  async getAgents(headers: Record<string, string>): Promise<any> {
    return this.request('agents', 'GET', headers);
  }
}
