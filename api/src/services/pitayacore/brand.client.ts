import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class BrandClient extends PitayaCoreBaseClient {
  async getBrandConfig(headers: Record<string, string>): Promise<any> {
    return this.request('brands', 'GET', headers);
  }
}
