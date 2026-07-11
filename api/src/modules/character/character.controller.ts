import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CharacterService } from './character.service';

@Controller('api/tenants/:tenantId/characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  async getCharacters(@Param('tenantId') tenantId: string) {
    return this.characterService.getCharacters(tenantId);
  }

  @Get(':id')
  async getCharacter(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.characterService.getCharacterById(tenantId, id);
  }

  @Post()
  async createCharacter(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      name: string;
      description: string;
      industry: string;
      avatarUrl: string;
      brandId?: string;
    },
  ) {
    return this.characterService.createCharacter(tenantId, body);
  }

  @Delete(':id')
  async deleteCharacter(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.characterService.deleteCharacter(tenantId, id);
  }
}
