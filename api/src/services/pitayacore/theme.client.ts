import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class ThemeClient extends PitayaCoreBaseClient {
  async getThemeConfig(headers: Record<string, string>): Promise<any> {
    return this.request('design/white-label/config', 'GET', headers);
  }
}
