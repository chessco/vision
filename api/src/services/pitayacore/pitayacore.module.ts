import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { AgentClient } from './agent.client';
import { AssetClient } from './asset.client';
import { BrandClient } from './brand.client';
import { CampaignClient } from './campaign.client';
import { PublisherClient } from './publisher.client';
import { CharacterClient } from './character.client';
import { ThemeClient } from './theme.client';
import { AnalyticsClient } from './analytics.client';
import { CreativeRuntimeClient } from './creative-runtime.client';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    AgentClient,
    AssetClient,
    BrandClient,
    CampaignClient,
    PublisherClient,
    CharacterClient,
    ThemeClient,
    AnalyticsClient,
    CreativeRuntimeClient,
  ],
  exports: [
    AgentClient,
    AssetClient,
    BrandClient,
    CampaignClient,
    PublisherClient,
    CharacterClient,
    ThemeClient,
    AnalyticsClient,
    CreativeRuntimeClient,
  ],
})
export class PitayaCoreModule {}
