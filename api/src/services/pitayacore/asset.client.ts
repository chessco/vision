import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class AssetClient extends PitayaCoreBaseClient {
  async registerAsset(headers: Record<string, string>, assetData: any): Promise<any> {
    return this.request('assets', 'POST', headers, assetData);
  }
}
