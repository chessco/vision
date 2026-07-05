import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('api')
export class HealthProxyController {
  @Get('health-check')
  async healthCheck(@Query('url') url: string) {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${url}/api/api/health`, {
        method: 'GET',
        headers: {
          'x-api-key': process.env.PITAYACORE_API_KEY || '',
          'x-user-role': 'ADMIN',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        return { ok: true, data };
      } else {
        return { ok: false, status: res.status, statusText: res.statusText };
      }
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'Timeout: El servidor no respondió en 8s'
        : err?.message || 'No se pudo conectar';
      throw new HttpException(msg, HttpStatus.BAD_GATEWAY);
    }
  }
}
