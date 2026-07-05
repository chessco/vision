import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/tenants/:tenantId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Param('tenantId') tenantId: string) {
    return this.dashboardService.getDashboardData(tenantId);
  }
}
