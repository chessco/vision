import { Controller, Get, Param, Delete } from '@nestjs/common';
import { CampaignService } from './campaign.service';

@Controller('api/tenants/:tenantId/campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async getCampaigns(@Param('tenantId') tenantId: string) {
    return this.campaignService.getCampaigns(tenantId);
  }

  @Get(':id')
  async getCampaign(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.campaignService.getCampaignById(tenantId, id);
  }

  @Delete(':id')
  async deleteCampaign(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.campaignService.deleteCampaign(tenantId, id);
  }
}
