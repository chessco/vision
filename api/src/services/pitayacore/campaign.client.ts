import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class CampaignClient extends PitayaCoreBaseClient {
  async getCampaigns(headers: Record<string, string>): Promise<any> {
    return this.request('campaigns', 'GET', headers);
  }
}
