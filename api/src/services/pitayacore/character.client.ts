import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';

@Injectable()
export class CharacterClient extends PitayaCoreBaseClient {
  async getCharacters(headers: Record<string, string>): Promise<any> {
    return this.request('characters', 'GET', headers);
  }
}
