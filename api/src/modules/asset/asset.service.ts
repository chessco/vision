import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AssetService {
  constructor(private readonly db: DatabaseService) {}

  async getAssets(tenantId: string) {
    return this.db.mysql.asset.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { name: true } },
      },
    });
  }

  async getAssetById(tenantId: string, id: string) {
    const asset = await this.db.mysql.asset.findUnique({
      where: { id, tenantId },
      include: { campaign: true },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async deleteAsset(tenantId: string, id: string) {
    return this.db.mysql.asset.delete({
      where: { id, tenantId },
    });
  }
}
