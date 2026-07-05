// ─── Shared TypeScript Interfaces ────────────────────────────────
// All types consumed across Vision studios.
// These mirror the expected PitayaCore API contract.

// ─── Brand ──────────────────────────────────────────────────────
export interface Brand {
  id: string;
  name: string;
  logo?: string;
  logoDark?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  colors: string[];
  typography?: {
    headingFont: string;
    bodyFont: string;
  };
  styleGuidelines: string;
  toneOfVoice: string;
  brandVoice?: string;
  communicationStyle?: string;
  allowedTerms?: string[];
  forbiddenTerms?: string[];
  ctaStyle?: string;
  competitors?: Competitor[];
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  website?: string;
  strengths?: string;
  weaknesses?: string;
}

// ─── Audience ───────────────────────────────────────────────────
export interface AudiencePersona {
  id: string;
  name: string;
  avatar?: string;
  age: string;
  gender: string;
  location: string;
  occupation: string;
  income?: string;
  interests: string[];
  painPoints: string[];
  goals: string[];
  emotions: EmotionPoint[];
  behaviors: string[];
  platforms: string[];
  customerJourneyStage: 'awareness' | 'consideration' | 'decision' | 'retention' | 'advocacy';
}

export interface EmotionPoint {
  emotion: string;
  intensity: number; // 0-100
  trigger: string;
}

// ─── Campaign ───────────────────────────────────────────────────
export interface AssetPreview {
  id: string;
  url: string;
  type: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  audience: string;
  audienceId?: string;
  channels: SocialChannel[];
  budget?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  status: CampaignStatus;
  contentPieces: ContentPiece[];
  assets: AssetPreview[];
  metrics?: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'draft' | 'planning' | 'active' | 'paused' | 'completed' | 'archived';

export interface CampaignMetrics {
  reach: number;
  impressions: number;
  engagement: number;
  ctr: number;
  conversions: number;
  roi: number;
}

// ─── Content ────────────────────────────────────────────────────
export interface ContentPiece {
  id: string;
  campaignId?: string;
  platform: SocialChannel;
  type: ContentType;
  text: string;
  humanizedText?: string;
  mediaUrls: string[];
  hashtags: string[];
  cta?: string;
  linkUrl?: string;
  status: ContentStatus;
  scores: ContentScores;
  versions: ContentVersion[];
  createdAt: string;
}

export type ContentType = 'text' | 'image' | 'carousel' | 'video' | 'reel' | 'story' | 'link';
export type ContentStatus = 'draft' | 'generated' | 'humanized' | 'reviewing' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface ContentScores {
  humanScore: number;
  emotionScore: number;
  authenticityScore: number;
  brandScore: number;
}

export interface ContentVersion {
  id: string;
  label: string; // "Version A", "Version B", etc.
  text: string;
  selected: boolean;
}

// ─── Social Publishing ──────────────────────────────────────────
export type SocialChannel = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'whatsapp';

export interface SocialPost {
  id: string;
  platform: SocialChannel;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  linkUrl?: string;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  platformPostId?: string;
  metrics?: PostMetrics;
  approvalHistory: ApprovalEntry[];
  createdAt: string;
}

export type PostStatus = 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface PostMetrics {
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement: number;
}

export interface ApprovalEntry {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  reviewerName: string;
  comment?: string;
  timestamp: string;
}

// ─── Social Accounts ────────────────────────────────────────────
export interface SocialAccount {
  id: string;
  platform: SocialChannel;
  accountName: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'expired';
  pages: SocialPage[];
  tokenExpiresAt?: string;
  connectedAt: string;
}

export interface SocialPage {
  id: string;
  name: string;
  pageId: string;
  assignedBrandId?: string;
  assignedCampaignIds: string[];
  connected: boolean;
}

// ─── Analytics ──────────────────────────────────────────────────
export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  sparkline?: number[];
}

export interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'opportunity' | 'learning';
  title: string;
  description: string;
  metric?: string;
  value?: string;
  actionLabel?: string;
}

// ─── Trends ─────────────────────────────────────────────────────
export interface TrendTopic {
  id: string;
  topic: string;
  hashtags: string[];
  velocity: 'rising' | 'stable' | 'declining';
  score: number; // 0-100 opportunity score
  region?: string;
  category?: string;
  relatedPosts?: number;
}

// ─── Characters ─────────────────────────────────────────────────
export interface Character {
  id: string;
  name: string;
  type: string;
  industry: string;
  vertical: string;
  physicalDescription: string;
  personality: string;
  mission: string;
  avatarUrl: string;
  referenceImages: string[];
  status: 'DRAFT' | 'TRAINING' | 'ACTIVE' | 'ARCHIVED';
  voice?: string;
  skills?: string[];
  channels?: SocialChannel[];
  performance?: CharacterPerformance;
}

export interface CharacterPerformance {
  totalPosts: number;
  engagement: number;
  reach: number;
  avgLikes: number;
}

// ─── Assets ─────────────────────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  url: string;
  type: AssetType;
  format: string;
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  campaignId?: string;
  characterId?: string;
  tags: string[];
  collection?: string;
  createdAt: string;
}

export type AssetType = 'image' | 'video' | 'lora' | 'template' | 'brand_asset' | 'generated';

// ─── Notifications ──────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'publishing' | 'generation';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ─── Agent Pipeline ─────────────────────────────────────────────
export interface AgentStep {
  id: string;
  agent: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  output?: string;
  duration?: number;
}

export type AgentPipelineStage =
  | 'creative_director'
  | 'strategist'
  | 'copywriter'
  | 'humanizer'
  | 'compliance'
  | 'designer'
  | 'publisher';

// ─── Calendar Event ─────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  platform: SocialChannel;
  status: PostStatus;
  campaignId?: string;
  contentId?: string;
}

// ─── Optimization ───────────────────────────────────────────────
export interface OptimizationRecommendation {
  id: string;
  type: 'content' | 'timing' | 'audience' | 'channel' | 'budget';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'pending' | 'applied' | 'dismissed';
}
