import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class CampaignService {
  constructor(private readonly db: DatabaseService) {}

  async getCampaigns(tenantId: string) {
    return this.db.mysql.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        assets: {
          select: { id: true, url: true, type: true },
          take: 3,
        },
      },
    });
  }

  async getCampaignById(tenantId: string, id: string) {
    const campaign = await this.db.mysql.campaign.findUnique({
      where: { id, tenantId },
      include: { assets: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async deleteCampaign(tenantId: string, id: string) {
    return this.db.mysql.campaign.delete({
      where: { id, tenantId },
    });
  }
}
