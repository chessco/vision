import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('api/tenants/:tenantId/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getBrandConfig(@Param('tenantId') tenantId: string) {
    return this.brandService.getBrandConfig(tenantId);
  }

  @Post()
  async updateBrandConfig(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.brandService.updateBrandConfig(tenantId, body);
  }
}
