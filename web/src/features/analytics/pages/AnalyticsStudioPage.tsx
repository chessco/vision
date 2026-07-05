// ─── Analytics Studio Page ────────────────────────────────────────
// Executive analytics dashboard with metrics and AI insights.

import { useState } from 'react';
import { BarChart3, TrendingUp, Lightbulb, Target, Eye } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, MetricCard, } from '../../../components/ui';
import { MOCK_ANALYTICS_METRICS, MOCK_AI_INSIGHTS } from '../../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import clsx from 'clsx';

type AnalyticsTab = 'overview' | 'ai-insights' | 'channels';

const CHART_DATA = [
  { name: 'Mon', reach: 4200, engagement: 380, impressions: 8400 },
  { name: 'Tue', reach: 5100, engagement: 420, impressions: 9800 },
  { name: 'Wed', reach: 4800, engagement: 510, impressions: 9200 },
  { name: 'Thu', reach: 6200, engagement: 620, impressions: 12100 },
  { name: 'Fri', reach: 5800, engagement: 480, impressions: 11200 },
  { name: 'Sat', reach: 3400, engagement: 310, impressions: 6800 },
  { name: 'Sun', reach: 2900, engagement: 280, impressions: 5800 },
];

const CHANNEL_DATA = [
  { channel: 'Facebook', reach: 48200, engagement: 8.4, ctr: 3.2, leads: 340, color: '#3b82f6' },
  { channel: 'Instagram', reach: 36800, engagement: 12.1, ctr: 2.8, leads: 210, color: '#ec4899' },
  { channel: 'LinkedIn', reach: 18400, engagement: 4.2, ctr: 4.1, leads: 180, color: '#0ea5e9' },
  { channel: 'X', reach: 12100, engagement: 3.8, ctr: 1.9, leads: 67, color: '#ffffff' },
  { channel: 'TikTok', reach: 9000, engagement: 15.3, ctr: 1.2, leads: 50, color: '#f43f5e' },
];

export function AnalyticsStudioPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const metrics = MOCK_ANALYTICS_METRICS;
  const insights = MOCK_AI_INSIGHTS;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'channels', label: 'Channels', icon: Target },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={BarChart3}
        title="Analytics Studio"
        description="Executive analytics dashboard. Understand what works, why it works, and what to do next."
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as AnalyticsTab)} />

      {activeTab === 'overview' && (
        <div className="space-y-6 stagger-children">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.slice(0, 8).map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.label === 'CTR' || metric.label === 'Engagement' ? `${metric.value}%` : metric.value}
                change={metric.change}
                trend={metric.trend}
                sparkline={metric.sparkline}
                suffix={metric.label === 'ROI' ? '%' : ''}
              />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassPanel className="p-6">
              <h3 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider mb-4">Reach Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262235" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#13111c', border: '1px solid #262235', borderRadius: '8px', fontSize: 12, color: '#fff' }} />
                  <Area type="monotone" dataKey="reach" stroke="#8b5cf6" fill="url(#reachGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider mb-4">Engagement by Day</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262235" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#13111c', border: '1px solid #262235', borderRadius: '8px', fontSize: 12, color: '#fff' }} />
                  <Bar dataKey="engagement" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassPanel>
          </div>
        </div>
      )}

      {activeTab === 'ai-insights' && (
        <div className="space-y-4 stagger-children">
          <GlassPanel className="p-5 border-l-4 border-l-primary">
            <h3 className="text-sm font-labels font-semibold text-primary uppercase tracking-wider mb-1">AI Analytics Summary</h3>
            <p className="text-sm text-white">Your content performance improved 18% this week. Storytelling posts are your strongest format, and Facebook remains your highest-converting channel.</p>
          </GlassPanel>

          {insights.map((insight) => (
            <GlassPanel key={insight.id} className="p-5 flex items-start gap-4" hover>
              <div className={clsx(
                'p-2 rounded-lg shrink-0',
                insight.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                insight.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                insight.type === 'opportunity' ? 'bg-blue-500/10 text-blue-400' :
                'bg-primary/10 text-primary',
              )}>
                {insight.type === 'success' ? <TrendingUp className="w-5 h-5" /> :
                 insight.type === 'warning' ? <Eye className="w-5 h-5" /> :
                 insight.type === 'opportunity' ? <Target className="w-5 h-5" /> :
                 <Lightbulb className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                <p className="text-xs text-ink-muted mt-1">{insight.description}</p>
              </div>
              {insight.value && (
                <span className={clsx(
                  'text-lg font-headings font-bold shrink-0',
                  insight.type === 'success' ? 'text-emerald-400' :
                  insight.type === 'warning' ? 'text-amber-400' : 'text-primary',
                )}>
                  {insight.value}
                </span>
              )}
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-4 stagger-children">
          {CHANNEL_DATA.map((channel) => (
            <GlassPanel key={channel.channel} className="p-5" hover>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: channel.color }} />
                <div className="w-24 shrink-0">
                  <span className="text-sm font-medium text-white">{channel.channel}</span>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider">Reach</p>
                    <p className="text-sm text-white font-medium">{channel.reach.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider">Engagement</p>
                    <p className="text-sm text-white font-medium">{channel.engagement}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider">CTR</p>
                    <p className="text-sm text-white font-medium">{channel.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase tracking-wider">Leads</p>
                    <p className="text-sm text-white font-medium">{channel.leads}</p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
