import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName = process.env.R2_BUCKET_NAME || 'pitaya-visual-assets';
  private readonly publicUrl = process.env.R2_PUBLIC_URL || 'https://assets.pitayacore.com';

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID || 'dummy_account'}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || 'dummy_id',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'dummy_secret',
      },
    });
  }

  async uploadFile(buffer: Buffer, contentType: string, extension: string = 'png'): Promise<string> {
    const filename = `${randomUUID()}.${extension}`;
    this.logger.log(`Uploading ${filename} to Cloudflare R2...`);

    try {
      if (!process.env.R2_ACCOUNT_ID) {
        throw new Error('R2_ACCOUNT_ID not configured');
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      
      const finalUrl = `${this.publicUrl}/${filename}`;
      this.logger.log(`Uploaded to: ${finalUrl}`);
      return finalUrl;
    } catch (error) {
      this.logger.error('Error uploading file to R2. Using fallback URL.', error);
      // Fallback if R2 is not configured during dev
      return `http://localhost:3001/safe_streets_banner.png?fallback=${filename}`;
    }
  }
}
