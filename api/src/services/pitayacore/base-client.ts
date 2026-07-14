import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export abstract class PitayaCoreBaseClient {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly baseUrl: string;
  protected readonly apiKey: string;

  constructor() {
    this.baseUrl =
      process.env.PITAYACORE_URL || 'https://pitayacore-api.pitayacode.io';
    this.apiKey = process.env.PITAYACORE_API_KEY || '';
  }

  protected async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    headers: Record<string, string>,
    body?: any,
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${path}`;
    const startTime = Date.now();
    const executionId = `exec-${Math.random().toString(36).substring(2, 11)}`;

    const requestHeaders: Record<string, string> = {
      'x-api-key': this.apiKey,
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

    this.logger.debug(
      `[${executionId}] Initializing request to PitayaCore: ${method} ${path}`,
    );

    try {
      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      const latency = Date.now() - startTime;

      // Telemetry log (not visible to users)
      this.logger.log(
        `[Telemetry] ExecutionId: ${executionId} | Path: ${path} | Latency: ${latency}ms | Status: ${res.status}`,
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new HttpException(
          errText || `PitayaCore returned status code ${res.status}`,
          res.status,
        );
      }

      const data = await res.json();
      return data as T;
    } catch (err: any) {
      const latency = Date.now() - startTime;
      this.logger.error(
        `[Telemetry Failed] ExecutionId: ${executionId} | Path: ${path} | Latency: ${latency}ms | Error: ${err.message}`,
      );

      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        err?.message || 'Error connecting to PitayaCore runtime service',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
