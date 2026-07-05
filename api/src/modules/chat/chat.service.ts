import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

const PITAYACORE_URL = process.env.PITAYACORE_URL || 'https://pitayacore-api.pitayacode.io';
const PITAYACORE_API_KEY = process.env.PITAYACORE_API_KEY || '';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    public readonly db: DatabaseService,
  ) {}

  async getSessions(tenantId: string) {
    let tenant = await this.db.mysql.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      tenant = await this.db.mysql.tenant.create({
        data: {
          id: tenantId,
          slug: tenantId,
        },
      });
      
      await this.db.mysql.brandConfig.create({
        data: {
          tenantId: tenantId,
          primaryColor: '#8b5cf6',
          secondaryColor: '#06b6d4',
          fontHeadings: 'Outfit',
          fontBody: 'Inter',
          styleGuidelines: 'Estilo fotográfico realista, iluminación natural, tomas de ángulo medio.',
          toneOfVoice: 'Seguro, empático, profesional',
        },
      });
    }

    return this.db.mysql.chatSession.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getSessionMessages(sessionId: string) {
    const session = await this.db.mysql.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return this.db.mysql.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSession(tenantId: string, title: string) {
    return this.db.mysql.chatSession.create({
      data: {
        tenantId,
        title,
      },
    });
  }

  async updateSessionTitle(sessionId: string, title: string) {
    const session = await this.db.mysql.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    const cleanTitle = (title || '').replace(/[\r\n]+/g, ' ').trim();
    if (!cleanTitle) {
      throw new NotFoundException('Title cannot be empty');
    }

    const finalTitle = cleanTitle.length > 60
      ? cleanTitle.substring(0, 57) + '...'
      : cleanTitle;

    await this.db.mysql.chatSession.update({
      where: { id: sessionId },
      data: { title: finalTitle },
    });

    return { id: sessionId, title: finalTitle };
  }

  async deleteSession(sessionId: string) {
    const session = await this.db.mysql.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    await this.db.mysql.chatMessage.deleteMany({
      where: { sessionId },
    });

    return this.db.mysql.chatSession.delete({
      where: { id: sessionId },
    });
  }

  async postMessage(sessionId: string, text: string) {
    const session = await this.db.mysql.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    const userMessage = await this.db.mysql.chatMessage.create({
      data: {
        sessionId,
        sender: 'user',
        text,
      },
    });

    // Only set title on the very first message, and only if title is the default
    const messageCount = await this.db.mysql.chatMessage.count({
      where: { sessionId },
    });

    if (messageCount === 1 && session.title === 'Nuevo Chat Creativo') {
      const cleanTitle = text.replace(/[\r\n]+/g, ' ').trim();
      const title = cleanTitle.length > 60
        ? cleanTitle.substring(0, 57) + '...'
        : cleanTitle || 'Nuevo Chat Creativo';
      await this.db.mysql.chatSession.update({
        where: { id: sessionId },
        data: { title },
      });
    }

    try {
      this.logger.log(`Calling PitayaCore remote for AI pipeline: ${text}`);

      // Call PitayaCore's chat endpoint which handles everything (strategy + image generation)
      const pitayaResult = await this.callPitayaCoreChat(session.tenantId, text);

      this.logger.log('Vision API saving message with:', {
        suggestedCopy: pitayaResult.suggestedCopy?.substring(0, 50) + '...',
        imagePrompt: pitayaResult.imagePrompt?.substring(0, 50) + '...',
        bannerUrl: pitayaResult.bannerUrl,
      });

      const completedSteps = [
        { label: 'Analizando solicitud con Director Creativo IA', status: 'done' },
        { label: 'Generando estrategia completa de campaña', status: 'done' },
        { label: 'Optimizando prompt visual para FLUX', status: 'done' },
        { label: 'Renderizando banner de campaña con Fal.ai (FLUX)', status: 'done' },
      ];

      const aiMessage = await this.db.mysql.chatMessage.create({
        data: {
          sessionId,
          sender: 'ai',
          text: pitayaResult.content || `He procesado tu solicitud: "${text}".`,
          steps: completedSteps,
          suggestedCopy: pitayaResult.suggestedCopy || null,
          imagePrompt: pitayaResult.imagePrompt || null,
          bannerTitle: pitayaResult.bannerTitle || null,
          bannerStyle: pitayaResult.bannerStyle || 'FLUX Schnell • Fal.ai',
          bannerUrl: pitayaResult.bannerUrl || null,
          technicalDetails: pitayaResult.technicalDetails || null,
        },
      });

      return {
        userMessage,
        aiMessage,
      };
    } catch (error) {
      this.logger.error('Error in postMessage pipeline', error);
      throw error;
    }
  }

  private async callPitayaCoreChat(tenantId: string, message: string): Promise<any> {
    // First, create a session in PitayaCore
    const sessionRes = await fetch(`${PITAYACORE_URL}/api/tenants/${tenantId}/chat-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PITAYACORE_API_KEY,
        'x-user-role': 'ADMIN',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ title: 'Vision API Chat' }),
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text().catch(() => '');
      throw new Error(`PitayaCore session creation failed ${sessionRes.status}: ${errText}`);
    }

    const sessionData = await sessionRes.json();
    const pitayaSessionId = sessionData.id;

    // Then, send the message to get the full pipeline result
    const messageRes = await fetch(`${PITAYACORE_URL}/api/tenants/${tenantId}/chat-sessions/${pitayaSessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PITAYACORE_API_KEY,
        'x-user-role': 'ADMIN',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ text: message }),
    });

    if (!messageRes.ok) {
      const errText = await messageRes.text().catch(() => '');
      throw new Error(`PitayaCore message failed ${messageRes.status}: ${errText}`);
    }

    const result = await messageRes.json();
    
    this.logger.log('PitayaCore response:', JSON.stringify(result, null, 2));
    
    // Extract the relevant data from PitayaCore's response
    return {
      content: result.aiMessage?.text || result.aiMessage?.content,
      suggestedCopy: result.aiMessage?.suggestedCopy,
      imagePrompt: result.aiMessage?.imagePrompt,
      bannerTitle: result.aiMessage?.bannerTitle,
      bannerStyle: result.aiMessage?.bannerStyle,
      bannerUrl: result.aiMessage?.bannerUrl,
      technicalDetails: result.aiMessage?.technicalDetails,
    };
  }

  private videoJobs = new Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    resolution?: string;
    error?: string;
    pitayaJobId?: string;
    params: any;
    createdAt: number;
  }>();

  async submitVideoJob(params: {
    tenantId: string;
    conversationId: string;
    imageUrl: string;
    prompt: string;
    resolution: string;
    duration: string;
    aspectRatio: string;
    generateAudio: boolean;
    bitrateMode: string;
  }): Promise<{ jobId: string; status: string }> {
    const localJobId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    this.videoJobs.set(localJobId, {
      status: 'pending',
      params,
      createdAt: Date.now(),
    });

    this.logger.log(`Video job ${localJobId} created. Submitting to PitayaCore...`);

    const url = `${PITAYACORE_URL}/api/creative-suite/video/generate`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': PITAYACORE_API_KEY,
      'x-user-role': 'ADMIN',
      'x-tenant-id': params.tenantId,
    };
    const body = {
      imageUrl: params.imageUrl,
      prompt: params.prompt,
      resolution: params.resolution,
      duration: params.duration,
      aspectRatio: params.aspectRatio,
      generateAudio: params.generateAudio,
      bitrateMode: params.bitrateMode,
      source: 'vision-creative-chat',
      conversationId: params.conversationId,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const result = await res.json();
        this.logger.log('PitayaCore video response:', JSON.stringify(result, null, 2));

        const videoUrl = this.extractVideoUrl(result);
        const pitayaJobId = result.jobId || result.requestId || result.id || result.taskId || null;
        const thumbnailUrl = result.thumbnailUrl || result.thumbnail || result.posterUrl || null;

        if (videoUrl) {
          this.logger.log(`Video URL received immediately: ${videoUrl}`);
          await this.completeVideoJob(localJobId, videoUrl, thumbnailUrl, params, result);
          return { jobId: localJobId, status: 'completed' };
        }

        if (pitayaJobId) {
          this.logger.log(`Got PitayaCore job ID: ${pitayaJobId}. Starting background polling.`);
          const job = this.videoJobs.get(localJobId);
          if (job) {
            job.status = 'processing';
            job.pitayaJobId = pitayaJobId;
          }
          this.pollVideoInBackground(localJobId, pitayaJobId, params, headers);
          return { jobId: localJobId, status: 'processing' };
        }

        this.logger.error('PitayaCore returned no video URL and no job ID:', JSON.stringify(result));
        const job = this.videoJobs.get(localJobId);
        if (job) {
          job.status = 'failed';
          job.error = 'PitayaCore did not return a video URL or job ID';
        }
        return { jobId: localJobId, status: 'failed' };
      }

      const errText = await res.text().catch(() => '');
      this.logger.warn(`PitayaCore returned ${res.status}: ${errText}`);

      if (res.status === 504 || res.status === 502 || res.status === 503) {
        this.logger.log('Gateway timeout. Video is likely still processing on PitayaCore. Starting background retry.');
        const job = this.videoJobs.get(localJobId);
        if (job) job.status = 'processing';
        this.retryVideoInBackground(localJobId, url, headers, body, params);
        return { jobId: localJobId, status: 'processing' };
      }

      const job = this.videoJobs.get(localJobId);
      if (job) {
        job.status = 'failed';
        job.error = `PitayaCore returned ${res.status}`;
      }
      return { jobId: localJobId, status: 'failed' };
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.log('Request timed out (25s). Video is likely still processing. Starting background retry.');
        const job = this.videoJobs.get(localJobId);
        if (job) job.status = 'processing';
        this.retryVideoInBackground(localJobId, url, headers, body, params);
        return { jobId: localJobId, status: 'processing' };
      }

      this.logger.error('Error submitting video job:', error.message);
      const job = this.videoJobs.get(localJobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
      return { jobId: localJobId, status: 'failed' };
    }
  }

  getVideoJobStatus(jobId: string) {
    const job = this.videoJobs.get(jobId);
    if (!job) return null;
    return {
      jobId,
      status: job.status,
      videoUrl: job.videoUrl,
      thumbnailUrl: job.thumbnailUrl,
      duration: job.duration,
      resolution: job.resolution,
      error: job.error,
    };
  }

  private async completeVideoJob(
    localJobId: string,
    videoUrl: string,
    thumbnailUrl: string | null,
    params: any,
    rawResult: any,
  ) {
    const job = this.videoJobs.get(localJobId);
    if (job) {
      job.status = 'completed';
      job.videoUrl = videoUrl;
      job.thumbnailUrl = thumbnailUrl || undefined;
      job.duration = rawResult.duration || rawResult.videoDuration || undefined;
      job.resolution = rawResult.resolution || params.resolution;
    }

    try {
      await this.db.mysql.asset.create({
        data: {
          tenantId: params.tenantId,
          type: 'VIDEO',
          title: `Video: ${params.prompt.substring(0, 50)}...`,
          url: videoUrl,
          dimensions: params.resolution,
          sizeBytes: rawResult.fileSize || rawResult.size || 0,
          prompt: params.prompt,
          status: 'READY',
        },
      });
    } catch (assetError) {
      this.logger.warn('Failed to store video asset in Vision DB:', assetError);
    }
  }

  private async pollVideoInBackground(
    localJobId: string,
    pitayaJobId: string,
    params: any,
    headers: Record<string, string>,
  ) {
    const pollUrl = `${PITAYACORE_URL}/api/creative-suite/video/status/${pitayaJobId}`;
    const maxAttempts = 120;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const job = this.videoJobs.get(localJobId);
      if (!job) return;

      try {
        const statusRes = await fetch(pollUrl, { headers });
        if (statusRes.ok) {
          const statusResult = await statusRes.json();
          const status = (statusResult.status || '').toLowerCase();
          this.logger.log(`Video poll ${localJobId} attempt ${attempt}: status=${status}`);

          if (status === 'completed' || status === 'done' || status === 'succeeded') {
            const videoUrl = this.extractVideoUrl(statusResult);
            if (videoUrl) {
              await this.completeVideoJob(localJobId, videoUrl, statusResult.thumbnailUrl, params, statusResult);
              this.logger.log(`Video job ${localJobId} completed: ${videoUrl}`);
              return;
            }
            this.logger.error('Video completed but no URL in status response:', JSON.stringify(statusResult));
            job.status = 'failed';
            job.error = 'Video completed but no URL returned';
            return;
          }

          if (status === 'failed' || status === 'error') {
            job.status = 'failed';
            job.error = statusResult.error || statusResult.message || 'Video generation failed';
            return;
          }
        }
      } catch (pollError) {
        this.logger.warn(`Video poll ${localJobId} attempt ${attempt} error: ${pollError.message}`);
      }
    }

    const job = this.videoJobs.get(localJobId);
    if (job) {
      job.status = 'failed';
      job.error = 'Video generation timed out after 10 minutes';
    }
  }

  private async retryVideoInBackground(
    localJobId: string,
    url: string,
    headers: Record<string, string>,
    body: any,
    params: any,
  ) {
    const maxRetries = 5;
    const delays = [30000, 60000, 120000, 180000, 300000];

    for (let retry = 0; retry < maxRetries; retry++) {
      await new Promise(resolve => setTimeout(resolve, delays[retry]));

      const job = this.videoJobs.get(localJobId);
      if (!job || job.status === 'completed' || job.status === 'failed') return;

      this.logger.log(`Video retry ${localJobId} attempt ${retry + 1}/${maxRetries}`);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 55000);

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const result = await res.json();
          const videoUrl = this.extractVideoUrl(result);
          const pitayaJobId = result.jobId || result.requestId || result.id || result.taskId || null;

          if (videoUrl) {
            await this.completeVideoJob(localJobId, videoUrl, result.thumbnailUrl, params, result);
            this.logger.log(`Video retry ${localJobId} succeeded: ${videoUrl}`);
            return;
          }

          if (pitayaJobId) {
            this.logger.log(`Video retry got job ID: ${pitayaJobId}. Switching to polling.`);
            job.pitayaJobId = pitayaJobId;
            this.pollVideoInBackground(localJobId, pitayaJobId, params, headers);
            return;
          }
        }

        this.logger.warn(`Video retry ${localJobId} returned ${res.status}`);
      } catch (error) {
        if (error.name === 'AbortError') {
          this.logger.warn(`Video retry ${localJobId} timed out`);
        } else {
          this.logger.warn(`Video retry ${localJobId} error: ${error.message}`);
        }
      }
    }

    const job = this.videoJobs.get(localJobId);
    if (job && job.status !== 'completed') {
      job.status = 'failed';
      job.error = 'Video generation failed after multiple retries. The video may still be available in your Assets.';
    }
  }

  private extractVideoUrl(result: any): string | null {
    const candidates = [
      result.videoUrl,
      result.video_url,
      result.url,
      result.output?.videoUrl,
      result.output?.video_url,
      result.output?.url,
      result.data?.videoUrl,
      result.data?.video_url,
      result.data?.url,
      result.result?.videoUrl,
      result.result?.video_url,
      result.result?.url,
      result.asset?.url,
      result.video?.url,
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && candidate.startsWith('http')) {
        return candidate;
      }
    }
    return null;
  }

  private async pollVideoStatus(
    jobId: string,
    params: { tenantId: string; prompt: string; resolution: string },
    headers: Record<string, string>,
  ): Promise<any> {
    const pollUrl = `${PITAYACORE_URL}/api/creative-suite/video/status/${jobId}`;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      try {
        const statusRes = await fetch(pollUrl, { headers });
        if (statusRes.ok) {
          const statusResult = await statusRes.json();
          const status = (statusResult.status || '').toLowerCase();
          this.logger.log(`Video poll attempt ${attempts}: status=${status}, keys=${Object.keys(statusResult)}`);

          if (status === 'completed' || status === 'done' || status === 'succeeded') {
            this.logger.log('Video completed. Full status response:', JSON.stringify(statusResult, null, 2));

            const videoUrl = this.extractVideoUrl(statusResult);
            const thumbnailUrl = statusResult.thumbnailUrl || statusResult.thumbnail || statusResult.posterUrl || null;

            if (!videoUrl) {
              this.logger.error('Video completed but no URL found in response:', JSON.stringify(statusResult));
              throw new Error('Video generation completed but no video URL was returned');
            }

            try {
              await this.db.mysql.asset.create({
                data: {
                  tenantId: params.tenantId,
                  type: 'VIDEO',
                  title: `Video: ${params.prompt.substring(0, 50)}...`,
                  url: videoUrl,
                  dimensions: params.resolution,
                  sizeBytes: statusResult.fileSize || statusResult.size || 0,
                  prompt: params.prompt,
                  status: 'READY',
                },
              });
            } catch (assetError) {
              this.logger.warn('Failed to store video asset in Vision DB:', assetError);
            }

            return {
              videoUrl,
              thumbnailUrl,
              duration: statusResult.duration || statusResult.videoDuration || null,
              resolution: statusResult.resolution || params.resolution,
              status: 'completed',
            };
          } else if (status === 'failed' || status === 'error') {
            throw new Error(statusResult.error || statusResult.message || 'Video generation failed');
          }
        }
      } catch (pollError) {
        if (pollError.message.includes('Video generation failed') || pollError.message.includes('no video URL')) {
          throw pollError;
        }
        this.logger.warn(`Polling attempt ${attempts} failed: ${pollError.message}`);
      }
    }

    throw new Error('Video generation timed out after 5 minutes');
  }

  async approveCampaign(sessionId: string) {
    const session = await this.db.mysql.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    const lastAiMessage = await this.db.mysql.chatMessage.findFirst({
      where: { sessionId, sender: 'ai' },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastAiMessage) {
      throw new NotFoundException('No assets to approve in this session');
    }

    const campaignName = session.title || 'Nueva Campaña de Redes';
    const campaign = await this.db.mysql.campaign.create({
      data: {
        tenantId: session.tenantId,
        name: campaignName,
        objective: lastAiMessage.suggestedCopy || 'Generado vía Creative Chat',
        audience: 'Comunidad general y vecinos',
        channels: ['Facebook'],
        formats: ['Banner'],
      },
    });

    const asset = await this.db.mysql.asset.create({
      data: {
        tenantId: session.tenantId,
        campaignId: campaign.id,
        type: 'IMAGE',
        title: lastAiMessage.bannerTitle || 'Banner de Campaña',
        url: lastAiMessage.bannerUrl || '/safe_streets_banner.png',
        dimensions: '1200 x 628 px',
        sizeBytes: 1258291,
        prompt: lastAiMessage.text,
        status: 'READY',
      },
    });

    await this.db.mysql.chatSession.update({
      where: { id: sessionId },
      data: { campaignId: campaign.id },
    });

    return {
      campaign,
      asset,
    };
  }
}
