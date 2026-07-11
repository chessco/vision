import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class BrandService {
  constructor(private readonly db: DatabaseService) {}

  async getBrands(tenantId: string) {
    return this.db.mysql.brand.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getBrand(id: string) {
    return this.db.mysql.brand.findUnique({
      where: { id },
    });
  }

  async createBrand(tenantId: string, data: any) {
    return this.db.mysql.brand.create({
      data: {
        tenantId,
        name: data.name || 'Nueva Marca',
        ...data,
      },
    });
  }

  async updateBrand(id: string, data: any) {
    return this.db.mysql.brand.update({
      where: { id },
      data,
    });
  }

  async deleteBrand(id: string) {
    return this.db.mysql.brand.delete({
      where: { id },
    });
  }
}
