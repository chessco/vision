import { Controller, Get, Param, Delete } from '@nestjs/common';
import { AssetService } from './asset.service';

@Controller('api/tenants/:tenantId/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  async getAssets(@Param('tenantId') tenantId: string) {
    return this.assetService.getAssets(tenantId);
  }

  @Get(':id')
  async getAsset(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.assetService.getAssetById(tenantId, id);
  }

  @Delete(':id')
  async deleteAsset(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.assetService.deleteAsset(tenantId, id);
  }
}
