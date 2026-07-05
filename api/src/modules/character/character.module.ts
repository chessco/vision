import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { StorageModule } from '../storage/storage.module';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [CharacterController],
  providers: [CharacterService],
})
export class CharacterModule {}
