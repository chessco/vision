import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardData(tenantId: string) {
    // Total Assets
    const totalAssets = await this.db.mysql.asset.count({
      where: { tenantId },
    });

    // Total Campaigns
    const totalCampaigns = await this.db.mysql.campaign.count({
      where: { tenantId },
    });

    // Total Characters
    const totalCharacters = await this.db.mysql.character.count({
      where: { tenantId },
    });

    // Total Chat Sessions
    const totalSessions = await this.db.mysql.chatSession.count({
      where: { tenantId },
    });

    // Recent Assets (mapped for DashboardPage consumption)
    const recentAssets = await this.db.mysql.asset.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        url: true,
        createdAt: true,
        type: true,
      },
    });

    // Recent Campaigns
    const recentCampaigns = await this.db.mysql.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Brand Configured status
    const brandConfig = await this.db.mysql.brandConfig.findUnique({
      where: { tenantId },
    });

    const brandConfigured = !!brandConfig && (!!brandConfig.logoUrl || !!brandConfig.primaryColor);

    return {
      stats: {
        totalAssets,
        totalCampaigns,
        totalCharacters,
        totalSessions,
      },
      recentAssets: recentAssets.map((a) => ({
        id: a.id,
        name: a.title || 'Asset sin título',
        url: a.url || '',
        createdAt: a.createdAt,
        type: a.type,
      })),
      recentCampaigns,
      brandConfigured,
    };
  }
}
