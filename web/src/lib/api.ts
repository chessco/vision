// ─── Centralized API Client ──────────────────────────────────────
// Wraps axios with tenant-aware headers and mock data fallbacks.
// When PitayaCore endpoints exist, switch mock → real by changing the flag.

import axios from 'axios';
import type {
  AudiencePersona,
  SocialAccount, AnalyticsMetric, AIInsight, TrendTopic,
  OptimizationRecommendation, CalendarEvent,
} from '../types';

// ─── API Endpoints ──────────────────────────────────────────────
export const API_ROUTES = {
  // Existing Vision API (through Vite proxy)
  brands: (tenantId: string) => `/api/tenants/${tenantId}/brand`,
  campaigns: (tenantId: string) => `/api/tenants/${tenantId}/campaigns`,
  characters: (tenantId: string) => `/api/tenants/${tenantId}/characters`,
  assets: (tenantId: string) => `/api/tenants/${tenantId}/assets`,
  chat: (tenantId: string) => `/api/tenants/${tenantId}/chat-sessions`,
  dashboard: (tenantId: string) => `/api/tenants/${tenantId}/dashboard`,

  // Future PitayaCore Social Suite endpoints (will go through proxy)
  audiences: (tenantId: string) => `/api/tenants/${tenantId}/audiences`,
  content: (tenantId: string) => `/api/tenants/${tenantId}/content`,
  social: {
    posts: (tenantId: string) => `/api/tenants/${tenantId}/social/posts`,
    accounts: (tenantId: string) => `/api/tenants/${tenantId}/social/accounts`,
    publisher: (tenantId: string) => `/api/tenants/${tenantId}/social/publisher`,
    calendar: (tenantId: string) => `/api/tenants/${tenantId}/social/calendar`,
    analytics: (tenantId: string) => `/api/tenants/${tenantId}/social/analytics`,
    optimization: (tenantId: string) => `/api/tenants/${tenantId}/social/optimization`,
    trends: (tenantId: string) => `/api/tenants/${tenantId}/social/trends`,
    facebook: (tenantId: string) => `/api/tenants/${tenantId}/social/facebook`,
  },
  agents: '/api/agents',
  memory: (tenantId: string) => `/api/tenants/${tenantId}/memory`,
} as const;

// ─── Mock Data ──────────────────────────────────────────────────
// These provide realistic demo data until PitayaCore endpoints exist.

export const MOCK_ANALYTICS_METRICS: AnalyticsMetric[] = [
  { label: 'Reach', value: 124500, change: 12.4, trend: 'up', sparkline: [65, 72, 80, 78, 92, 98, 124] },
  { label: 'Impressions', value: 342800, change: 8.7, trend: 'up', sparkline: [180, 210, 240, 260, 290, 310, 342] },
  { label: 'Engagement', value: 8.4, change: 2.1, trend: 'up', sparkline: [5.2, 6.1, 6.8, 7.2, 7.8, 8.0, 8.4] },
  { label: 'CTR', value: 3.2, change: -0.3, trend: 'down', sparkline: [3.8, 3.6, 3.5, 3.4, 3.3, 3.2, 3.2] },
  { label: 'Leads', value: 847, change: 15.2, trend: 'up', sparkline: [420, 510, 580, 640, 720, 790, 847] },
  { label: 'Conversions', value: 234, change: 22.1, trend: 'up', sparkline: [100, 120, 145, 170, 190, 210, 234] },
  { label: 'ROI', value: 340, change: 18.5, trend: 'up', sparkline: [180, 210, 240, 270, 300, 320, 340] },
  { label: 'Followers', value: 28400, change: 4.3, trend: 'up', sparkline: [24000, 25200, 26000, 26800, 27400, 27900, 28400] },
];

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  { id: '1', type: 'success', title: 'Storytelling performs 43% better', description: 'Posts with narrative structure generated 43% more engagement than product-focused content.', metric: 'engagement', value: '+43%' },
  { id: '2', type: 'opportunity', title: 'Facebook outperformed LinkedIn by 34%', description: 'Your Facebook campaigns reached 34% more qualified leads than LinkedIn this month.', metric: 'leads', value: '+34%' },
  { id: '3', type: 'warning', title: 'Fear-based messaging caution', description: 'Fear-based messaging generates more leads but 28% lower brand trust scores.', metric: 'trust', value: '-28%' },
  { id: '4', type: 'learning', title: 'Videos outperform images by 28%', description: 'Video content consistently drives higher engagement across all platforms.', metric: 'engagement', value: '+28%' },
  { id: '5', type: 'opportunity', title: 'Best posting time: 9-11 AM', description: 'Analysis shows your audience is most active between 9-11 AM on weekdays.', metric: 'reach', value: '+18%' },
];

export const MOCK_TREND_TOPICS: TrendTopic[] = [
  { id: '1', topic: 'AI-Powered Marketing', hashtags: ['#AIMarketing', '#MarTech', '#AutomatedCreative'], velocity: 'rising', score: 92, category: 'Technology' },
  { id: '2', topic: 'Sustainable Business', hashtags: ['#Sustainability', '#GreenBusiness', '#ESG'], velocity: 'rising', score: 87, category: 'Environment' },
  { id: '3', topic: 'Short-Form Video', hashtags: ['#Reels', '#Shorts', '#TikTok'], velocity: 'stable', score: 85, category: 'Content' },
  { id: '4', topic: 'Legal Tech Innovation', hashtags: ['#LegalTech', '#LawFirm', '#Justice'], velocity: 'rising', score: 78, category: 'Legal' },
  { id: '5', topic: 'Aquaculture Technology', hashtags: ['#Aquaculture', '#Seafood', '#BlueEconomy'], velocity: 'rising', score: 71, category: 'Industry' },
];

export const MOCK_AUDIENCE_PERSONAS: AudiencePersona[] = [
  {
    id: '1', name: 'Marketing Manager Maria', avatar: '', age: '28-35', gender: 'Female',
    location: 'Mexico City, MX', occupation: 'Marketing Manager', income: '$45-65k',
    interests: ['Digital Marketing', 'Brand Strategy', 'Social Media', 'Content Creation'],
    painPoints: ['Limited budget', 'Too many platforms', 'Content creation bottleneck', 'ROI measurement'],
    goals: ['Increase brand awareness', 'Generate qualified leads', 'Automate content creation'],
    emotions: [
      { emotion: 'Overwhelmed', intensity: 75, trigger: 'Managing multiple platforms' },
      { emotion: 'Excited', intensity: 85, trigger: 'Discovering AI tools' },
      { emotion: 'Frustrated', intensity: 60, trigger: 'Low engagement rates' },
    ],
    behaviors: ['Checks social media analytics daily', 'Uses scheduling tools', 'Attends marketing webinars'],
    platforms: ['facebook', 'instagram', 'linkedin'],
    customerJourneyStage: 'consideration',
  },
  {
    id: '2', name: 'SMB Owner Carlos', avatar: '', age: '35-45', gender: 'Male',
    location: 'Guadalajara, MX', occupation: 'Business Owner', income: '$60-90k',
    interests: ['Business Growth', 'ROI', 'Competitive Analysis', 'Customer Acquisition'],
    painPoints: ['No marketing team', 'Competitor outspending', 'Inconsistent posting'],
    goals: ['Grow customer base by 30%', 'Establish market authority', 'Reduce marketing costs'],
    emotions: [
      { emotion: 'Ambitious', intensity: 90, trigger: 'Growth opportunities' },
      { emotion: 'Skeptical', intensity: 65, trigger: 'AI marketing promises' },
    ],
    behaviors: ['Reviews competitors weekly', 'Delegates social media', 'Focuses on ROI metrics'],
    platforms: ['facebook', 'instagram', 'whatsapp'],
    customerJourneyStage: 'awareness',
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'AAA Abogados — Brand Story', date: '2026-07-07', time: '09:00', platform: 'facebook', status: 'scheduled', campaignId: '1' },
  { id: '2', title: 'Product Launch Carousel', date: '2026-07-07', time: '14:00', platform: 'instagram', status: 'approved' },
  { id: '3', title: 'Industry Insights Article', date: '2026-07-08', time: '10:00', platform: 'linkedin', status: 'pending_review' },
  { id: '4', title: 'Behind the Scenes Reel', date: '2026-07-09', time: '11:00', platform: 'instagram', status: 'draft' },
  { id: '5', title: 'Customer Testimonial', date: '2026-07-10', time: '09:00', platform: 'facebook', status: 'scheduled' },
  { id: '6', title: 'Weekly Tips Thread', date: '2026-07-10', time: '15:00', platform: 'x', status: 'draft' },
  { id: '7', title: 'Company Culture Post', date: '2026-07-11', time: '12:00', platform: 'linkedin', status: 'approved' },
];

export const MOCK_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: '1', platform: 'facebook', accountName: 'AAA Legal Group', accountId: 'fb-123',
    status: 'connected', connectedAt: '2026-06-15T10:00:00Z', tokenExpiresAt: '2026-09-15T10:00:00Z',
    pages: [
      { id: 'p1', name: 'AAA Abogados', pageId: 'fb-page-1', assignedBrandId: 'brand-1', assignedCampaignIds: ['c1'], connected: true },
      { id: 'p2', name: 'AAA Fiscal', pageId: 'fb-page-2', assignedBrandId: 'brand-1', assignedCampaignIds: [], connected: true },
    ],
  },
  {
    id: '2', platform: 'instagram', accountName: 'AAA Legal', accountId: 'ig-456',
    status: 'connected', connectedAt: '2026-06-15T10:00:00Z',
    pages: [{ id: 'p3', name: '@aaa_abogados', pageId: 'ig-page-1', assignedCampaignIds: ['c1'], connected: true }],
  },
  {
    id: '3', platform: 'linkedin', accountName: 'AAA Legal Group', accountId: 'li-789',
    status: 'expired', connectedAt: '2026-05-01T10:00:00Z', tokenExpiresAt: '2026-07-01T10:00:00Z',
    pages: [{ id: 'p4', name: 'AAA Legal Group', pageId: 'li-page-1', assignedCampaignIds: [], connected: false }],
  },
];

export const MOCK_OPTIMIZATION_RECOMMENDATIONS: OptimizationRecommendation[] = [
  { id: '1', type: 'timing', title: 'Shift posting to 9-11 AM', description: 'Your audience engagement peaks between 9-11 AM. Posting during this window could increase reach by 18%.', impact: 'high', effort: 'low', status: 'pending' },
  { id: '2', type: 'content', title: 'Add more storytelling posts', description: 'Narrative-driven content outperforms product posts by 43%. Consider a 60/40 story-to-product ratio.', impact: 'high', effort: 'medium', status: 'pending' },
  { id: '3', type: 'channel', title: 'Increase Facebook investment', description: 'Facebook generates 34% more qualified leads. Reallocate 15% of LinkedIn budget.', impact: 'medium', effort: 'low', status: 'pending' },
  { id: '4', type: 'audience', title: 'Target 28-35 professionals', description: 'This demographic shows 2.3x higher conversion rates for your campaigns.', impact: 'high', effort: 'medium', status: 'pending' },
  { id: '5', type: 'content', title: 'Increase video content', description: 'Videos drive 28% more engagement. Current mix is only 15% video.', impact: 'medium', effort: 'high', status: 'pending' },
];

// ─── API Client ─────────────────────────────────────────────────

const apiClient = axios.create({
  timeout: 15000,
});

// Request interceptor for tenant headers
apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  // Vision API calls use relative paths (Vite proxy)
  if (url.startsWith('/api/')) {
    config.baseURL = '';
  }
  return config;
});

export { apiClient };

// ─── Helper to get tenant ID ────────────────────────────────────
export function toApiTenantId(tenantId: string): string {
  return tenantId === 'default' ? 'DEFAULT_TENANT' : tenantId;
}
