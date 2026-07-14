import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
          Accept: 'application/json',
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
      const msg =
        err?.name === 'AbortError'
          ? 'Timeout: El servidor no respondió en 8s'
          : err?.message || 'No se pudo conectar';
      throw new HttpException(msg, HttpStatus.BAD_GATEWAY);
    }
  }

  @Get('design/white-label/config')
  async getWhiteLabelConfig(@Headers() headers: Record<string, string>) {
    return this.forwardToPitayaCore('design/white-label/config', 'GET', headers);
  }

  @Get('design/themes')
  async getThemes(@Headers() headers: Record<string, string>) {
    return this.forwardToPitayaCore('design/themes', 'GET', headers);
  }

  @Post('design/themes/:id/activate')
  async activateTheme(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.forwardToPitayaCore(`design/themes/${id}/activate`, 'POST', headers, {});
  }

  private async forwardToPitayaCore(
    path: string,
    method: string,
    headers: Record<string, string>,
    body?: any,
  ) {
    const baseUrl =
      process.env.PITAYACORE_URL || 'https://pitayacore-api.pitayacode.io';
    const url = `${baseUrl}/api/${path}`;

    const requestHeaders: Record<string, string> = {
      'x-api-key': process.env.PITAYACORE_API_KEY || '',
      'x-user-role': headers['x-user-role'] || 'ADMIN',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (headers['x-tenant-id']) {
      requestHeaders['x-tenant-id'] = headers['x-tenant-id'];
    }
    if (headers['authorization']) {
      requestHeaders['authorization'] = headers['authorization'];
    }

    try {
      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new HttpException(
          errText || `PitayaCore returned ${res.status}`,
          res.status,
        );
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        err?.message || 'Error connecting to PitayaCore',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}

