import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class AnalyticsClient extends PitayaCoreBaseClient {
  async getMetrics(headers: Record<string, string>): Promise<any> {
    return this.request('analytics', 'GET', headers);
  }
}
