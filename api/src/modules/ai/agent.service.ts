import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly pitayacoreUrl: string;
  private readonly pitayacoreApiKey: string;

  constructor() {
    this.pitayacoreUrl =
      process.env.PITAYACORE_URL || 'https://pitayacore-api.pitayacode.io';
    this.pitayacoreApiKey = process.env.PITAYACORE_API_KEY || '';
  }

  async generateCreativeStrategy(
    prompt: string,
    brandConfig?: {
      styleGuidelines?: string | null;
      toneOfVoice?: string | null;
      primaryColor?: string | null;
    },
    character?: {
      name?: string | null;
      description?: string | null;
      industry?: string | null;
    } | null,
    tenantId?: string,
  ) {
    this.logger.log(
      `Generating creative strategy via PitayaCore remote agent for: ${prompt}`,
    );

    try {
      const result = await this.callRemoteAgent(
        prompt,
        brandConfig,
        character,
        tenantId,
      );
      return result;
    } catch (remoteError) {
      this.logger.error(
        'Remote agent failed. Using hardcoded fallback.',
        remoteError,
      );
      return {
        copy: 'Conecta con lo que importa. Únete a la nueva era. ✨ #Innovación',
        title: 'Campaña Nueva Era',
        imagePrompt:
          'A high quality cinematic shot of a professional environment, realistic, natural lighting, highly detailed, 8k resolution.',
      };
    }
  }

  private async callRemoteAgent(
    prompt: string,
    brandConfig?: {
      styleGuidelines?: string | null;
      toneOfVoice?: string | null;
      primaryColor?: string | null;
    },
    character?: {
      name?: string | null;
      description?: string | null;
      industry?: string | null;
    } | null,
    tenantId?: string,
  ) {
    const url = `${this.pitayacoreUrl}/api/agents/creative-director/chat`;

    let message = prompt;
    if (brandConfig) {
      message += `\n\n[Configuración de marca] Estilo: ${brandConfig.styleGuidelines || 'N/A'}, Tono: ${brandConfig.toneOfVoice || 'N/A'}, Color: ${brandConfig.primaryColor || 'N/A'}`;
    }
    if (character) {
      message += `\n\n[Personaje] Nombre: ${character.name || 'N/A'}, Descripción: ${character.description || 'N/A'}, Industria: ${character.industry || 'N/A'}`;
    }
    message += `\n\nResponde ÚNICAMENTE con un JSON válido (sin markdown, sin bloques de código) con esta estructura: {"copy":"texto para publicación con hashtags","title":"título corto max 5 palabras","imagePrompt":"prompt EN INGLÉS detallado para generación de imagen FLUX con iluminación, cámara, sujeto, fondo y atmósfera"}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.pitayacoreApiKey,
      'x-user-role': 'ADMIN',
    };

    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`PitayaCore agent returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const content = data.content || '';

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.copy && parsed.imagePrompt) {
          return parsed;
        }
      }

      throw new Error('Remote agent did not return valid JSON strategy');
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
