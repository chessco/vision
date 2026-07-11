import { Injectable, Logger } from '@nestjs/common';
import { fal } from '@fal-ai/client';

@Injectable()
export class FalService {
  private readonly logger = new Logger(FalService.name);

  constructor() {
    // fal client automatically picks up FAL_KEY from process.env
  }

  async generateImage(
    prompt: string,
  ): Promise<{ url: string; contentType: string; buffer: Buffer }> {
    this.logger.log(`Calling Fal.ai remote for image generation...`);

    const result: any = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: prompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS' && update.logs) {
          this.logger.log(`Fal.ai progress...`);
        }
      },
    });

    if (
      !result ||
      !result.data ||
      !result.data.images ||
      result.data.images.length === 0
    ) {
      throw new Error('No images returned from Fal.ai');
    }

    const imageUrl = result.data.images[0].url;
    const contentType = result.data.images[0].content_type || 'image/jpeg';

    this.logger.log(`Image generated at Fal.ai: ${imageUrl}`);

    // Fetch the binary data from the URL so we can store it in our own storage (R2)
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      url: imageUrl,
      contentType,
      buffer,
    };
  }
}
