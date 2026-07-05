// ─── Feature Flags ───────────────────────────────────────────────
// Vision feature flag system. All flags default to true for development.
// In production, flags would be fetched from PitayaCore's feature flag service.

export const FEATURE_FLAGS = {
  // Social Suite
  BRAND_STUDIO: true,
  AUDIENCE_STUDIO: true,
  CAMPAIGN_STUDIO: true,
  CONTENT_STUDIO: true,
  PUBLISHER_STUDIO: true,
  ANALYTICS_STUDIO: true,
  OPTIMIZATION_STUDIO: true,
  TREND_STUDIO: true,

  // Social Publishing
  FACEBOOK_PUBLISHING: true,
  INSTAGRAM_PUBLISHING: true,
  LINKEDIN_PUBLISHING: true,
  X_PUBLISHING: false,
  TIKTOK_PUBLISHING: false,

  // Analytics
  SOCIAL_ANALYTICS: true,
  SOCIAL_OPTIMIZATION: true,
  SOCIAL_TRENDS: true,

  // Creative
  CHARACTER_STUDIO: true,
  ASSET_STUDIO: true,

  // Experimental
  AI_RECOMMENDATIONS: true,
  CONTEXT_PANEL: true,
  COMMAND_BAR: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

// React hook for feature flags
import { useMemo } from 'react';

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useMemo(() => isFeatureEnabled(flag), [flag]);
}
