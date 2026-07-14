import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class PublisherClient extends PitayaCoreBaseClient {
  async publish(headers: Record<string, string>, publishPayload: any): Promise<any> {
    return this.request('publisher', 'POST', headers, publishPayload);
  }
}
