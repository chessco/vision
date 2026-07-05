import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class CharacterService {
  constructor(private readonly db: DatabaseService) {}

  async getCharacters(tenantId: string) {
    return this.db.mysql.character.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCharacterById(tenantId: string, id: string) {
    const character = await this.db.mysql.character.findUnique({
      where: { id, tenantId },
    });
    if (!character) throw new NotFoundException('Character not found');
    return character;
  }

  async createCharacter(tenantId: string, data: {
    name: string;
    type?: string;
    industry?: string;
    vertical?: string;
    physicalDescription?: string;
    personality?: string;
    mission?: string;
    avatarUrl?: string;
    referenceImages?: string[];
    status?: string;
    description?: string;
  }) {
    const characterData: any = {
      tenantId,
      name: data.name,
      type: data.type || 'AI Influencer',
      industry: data.industry || '',
      vertical: data.vertical || 'General',
      physicalDescription: data.physicalDescription || data.description || '',
      personality: data.personality || '',
      mission: data.mission || '',
      avatarUrl: data.avatarUrl || '',
      status: data.status || 'DRAFT',
    };

    if (data.referenceImages && data.referenceImages.length > 0) {
      characterData.referenceImages = data.referenceImages;
    }

    return this.db.mysql.character.create({
      data: characterData,
    });
  }

  async deleteCharacter(tenantId: string, id: string) {
    return this.db.mysql.character.delete({
      where: { id, tenantId },
    });
  }
}
