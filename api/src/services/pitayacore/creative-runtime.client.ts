import { Injectable } from '@nestjs/common';
import { PitayaCoreBaseClient } from './base-client';
import { DatabaseService } from '../../common/database/database.service';

interface ContextOptions {
  tenantId: string;
  sessionId?: string;
  campaignId?: string;
  characterId?: string;
  brandId?: string;
  workspaceId?: string;
  conversationId?: string;
}

export interface CapabilityRequest {
  capability: string;
  tenantId: string;
  workspaceId: string;
  conversationId: string;
  payload: any;
}

export interface CapabilityResponse<T = any> {
  success: boolean;
  executionId: string;
  status: string;
  data: T;
  metadata: any;
}

@Injectable()
export class CreativeRuntimeClient extends PitayaCoreBaseClient {
  // Simple in-memory cache for performance
  private readonly cache = new Map<string, { value: any; expiry: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds cache TTL

  constructor(private readonly db: DatabaseService) {
    super();
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, value: any) {
    this.cache.set(key, { value, expiry: Date.now() + this.CACHE_TTL });
  }

  /**
   * Executes a platform capability through PitayaCore's Creative Runtime API
   */
  async executeCapability<T = any>(
    capability: string,
    options: ContextOptions,
    payload: any,
    headers: Record<string, string> = {},
  ): Promise<CapabilityResponse<T>> {
    const tenantId = options.tenantId;
    const workspaceId = options.workspaceId || 'default-workspace';
    const conversationId = options.conversationId || options.sessionId || 'default-session';

    // 1. Gather all automatic contexts
    const gatheredContext = await this.gatherContexts(options);

    // 2. Prepare payload wrapped with all contexts
    const capabilityPayload: CapabilityRequest = {
      capability,
      tenantId,
      workspaceId,
      conversationId,
      payload: {
        ...payload,
        context: gatheredContext,
      },
    };

    try {
      // Execute request on PitayaCore Creative Runtime API
      const result = await this.request<CapabilityResponse<T>>(
        'creative-runtime',
        'POST',
        headers,
        capabilityPayload,
      );
      return result;
    } catch (error: any) {
      this.logger.error(
        `Failed to execute capability: ${capability}. Error: ${error.message}. Running fallback...`,
      );

      // Offline fallback strategy
      const executionId = `fallback-${Math.random().toString(36).substring(2, 11)}`;
      const fallbackData = this.getFallbackData(capability, payload, gatheredContext);
      
      return {
        success: true,
        executionId,
        status: 'COMPLETED_FALLBACK',
        data: fallbackData,
        metadata: {
          offlineMode: true,
          error: error.message,
        },
      };
    }
  }

  // --- Capabilites APIs ---

  async generateImage(
    options: ContextOptions,
    prompt: string,
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'generateImage',
      options,
      { prompt },
      headers,
    );
  }

  async generateVideo(
    options: ContextOptions,
    prompt: string,
    headers: Record<string, string> = {},
  ) {
    // Expose video capability with placeholder (no full generation logic yet)
    return this.executeCapability(
      'generateVideo',
      options,
      { prompt },
      headers,
    );
  }

  async analyzeImage(
    options: ContextOptions,
    imageUrl: string,
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'analyzeImage',
      options,
      { imageUrl },
      headers,
    );
  }

  async generateCampaign(
    options: ContextOptions,
    prompt: string,
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'generateCampaign',
      options,
      { prompt },
      headers,
    );
  }

  async publishContent(
    options: ContextOptions,
    content: any,
    platforms: string[],
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'publishContent',
      options,
      { content, platforms },
      headers,
    );
  }

  async humanizeCopy(
    options: ContextOptions,
    text: string,
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'humanizeCopy',
      options,
      { text },
      headers,
    );
  }

  async generateCharacter(
    options: ContextOptions,
    profile: any,
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'generateCharacter',
      options,
      { profile },
      headers,
    );
  }

  async analyzeBrand(
    options: ContextOptions,
    brandDetails: any,
    headers: Record<string, string> = {},
  ) {
    return this.executeCapability(
      'analyzeBrand',
      options,
      { brandDetails },
      headers,
    );
  }

  // --- Context Gathering Helpers ---

  private async gatherContexts(options: ContextOptions) {
    const { tenantId, sessionId, campaignId, characterId, brandId } = options;

    const brandContext = await this.getBrandContext(tenantId, brandId);
    const characterContext = await this.getCharacterContext(tenantId, characterId, sessionId);
    const campaignContext = await this.getCampaignContext(tenantId, campaignId, sessionId);
    const workspaceContext = this.getWorkspaceContext(tenantId);

    return {
      brand: brandContext,
      character: characterContext,
      campaign: campaignContext,
      workspace: workspaceContext,
    };
  }

  private async getBrandContext(tenantId: string, brandId?: string) {
    const cacheKey = `brand:${tenantId}:${brandId || 'default'}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      let brand;
      if (brandId) {
        brand = await this.db.mysql.brand.findFirst({
          where: { id: brandId, tenantId },
        });
      } else {
        brand = await this.db.mysql.brand.findFirst({
          where: { tenantId },
        });
      }

      const context = brand
        ? {
            id: brand.id,
            name: brand.name,
            tone: brand.toneOfVoice,
            voice: brand.toneOfVoice,
            styleGuidelines: brand.styleGuidelines,
            primaryColor: brand.primaryColor,
            secondaryColor: brand.secondaryColor,
            fontHeadings: brand.fontHeadings,
            fontBody: brand.fontBody,
            logoUrl: brand.logoUrl,
          }
        : null;

      this.setCached(cacheKey, context);
      return context;
    } catch (e) {
      return null;
    }
  }

  private async getCharacterContext(tenantId: string, characterId?: string, sessionId?: string) {
    let resolvedId = characterId;

    if (!resolvedId && sessionId) {
      // Look up character inside session/chat if relevant
      // For Vision MVP, sessions might not link directly to characters, but we fetch if provided
    }

    if (!resolvedId) return null;

    const cacheKey = `char:${tenantId}:${resolvedId}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const character = await this.db.mysql.character.findFirst({
        where: { id: resolvedId, tenantId },
      });

      const context = character
        ? {
            id: character.id,
            name: character.name,
            type: character.type,
            personality: character.personality,
            mission: character.mission,
            prompt: character.personality,
            avatarUrl: character.avatarUrl,
          }
        : null;

      this.setCached(cacheKey, context);
      return context;
    } catch (e) {
      return null;
    }
  }

  private async getCampaignContext(tenantId: string, campaignId?: string, sessionId?: string) {
    let resolvedId = campaignId;

    if (!resolvedId && sessionId) {
      const session = await this.db.mysql.chatSession.findFirst({
        where: { id: sessionId, tenantId },
      });
      if (session?.campaignId) {
        resolvedId = session.campaignId;
      }
    }

    if (!resolvedId) return null;

    const cacheKey = `campaign:${tenantId}:${resolvedId}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    try {
      const campaign = await this.db.mysql.campaign.findUnique({
        where: { id: resolvedId },
        include: { assets: { take: 5 } },
      });

      const context = campaign
        ? {
            id: campaign.id,
            name: campaign.name,
            objective: campaign.objective,
            audience: campaign.audience,
            channels: campaign.channels,
            formats: campaign.formats,
            recentAssets: campaign.assets.map(a => ({
              id: a.id,
              type: a.type,
              url: a.url,
            })),
          }
        : null;

      this.setCached(cacheKey, context);
      return context;
    } catch (e) {
      return null;
    }
  }

  private getWorkspaceContext(tenantId: string) {
    return {
      tenant: tenantId,
      workspace: 'default-workspace',
      vertical: 'vision',
      language: 'es',
      country: 'MX',
      region: 'LATAM',
    };
  }

  // --- Mock Fallbacks ---

  private getFallbackData(capability: string, payload: any, context: any): any {
    switch (capability) {
      case 'generateImage':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000',
          provider: 'Fallback Local Flux',
          generationDate: new Date().toISOString(),
          tags: ['fallback', 'offline'],
        };
      case 'generateVideo':
        return {
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32115-large.mp4',
          provider: 'Fallback Local Video Engine',
          generationDate: new Date().toISOString(),
          tags: ['placeholder', 'video'],
        };
      case 'humanizeCopy':
        return {
          humanizedText: payload.text
            ? `${payload.text} ✨ (Humanizado por Pitaya Runtime local)`
            : 'Contenido humanizado offline.',
        };
      case 'generateCampaign':
        return {
          title: 'Campaña Creativa Vision (Offline)',
          strategy: 'Estrategia general para impulsar engagement.',
          copy: 'Impulsa tu negocio hoy con la Suite Vision. 🚀 #Negocios',
          imagePrompt: 'A beautiful visual representative of business success.',
        };
      default:
        return {
          message: 'Fallback executed successfully',
          payload,
        };
    }
  }
}
