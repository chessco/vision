import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('api/tenants/:tenantId/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getBrands(@Param('tenantId') tenantId: string) {
    return this.brandService.getBrands(tenantId);
  }

  @Get(':id')
  async getBrand(@Param('id') id: string) {
    return this.brandService.getBrand(id);
  }

  @Post()
  async createBrand(@Param('tenantId') tenantId: string, @Body() body: any) {
    return this.brandService.createBrand(tenantId, body);
  }

  @Put(':id')
  async updateBrand(@Param('id') id: string, @Body() body: any) {
    return this.brandService.updateBrand(id, body);
  }

  @Delete(':id')
  async deleteBrand(@Param('id') id: string) {
    return this.brandService.deleteBrand(id);
  }
}
