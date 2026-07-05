import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class BrandService {
  constructor(private readonly db: DatabaseService) {}

  async getBrandConfig(tenantId: string) {
    let config = await this.db.mysql.brandConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = await this.db.mysql.brandConfig.create({
        data: {
          tenantId,
          primaryColor: '#8b5cf6',
          styleGuidelines: 'Estilo fotográfico realista, iluminación natural',
          toneOfVoice: 'Profesional',
        },
      });
    }

    return config;
  }

  async updateBrandConfig(tenantId: string, data: any) {
    return this.db.mysql.brandConfig.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data,
      },
    });
  }
}
