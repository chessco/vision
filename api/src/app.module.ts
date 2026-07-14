import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController, HealthProxyController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { BrandModule } from './modules/brand/brand.module';
import { CharacterModule } from './modules/character/character.module';
import { AssetModule } from './modules/asset/asset.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PitayaCoreModule } from './services/pitayacore/pitayacore.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ChatModule,
    BrandModule,
    CharacterModule,
    AssetModule,
    CampaignModule,
    DashboardModule,
    PitayaCoreModule,
  ],
  controllers: [AppController, HealthProxyController],
  providers: [AppService],
})
export class AppModule {}
