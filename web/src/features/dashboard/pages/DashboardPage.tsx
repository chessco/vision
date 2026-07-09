// ─── Executive Dashboard ─────────────────────────────────────────
// Command center with KPIs, trending, upcoming publications, activity, and AI recommendations.

import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toApiTenantId, MOCK_ANALYTICS_METRICS, MOCK_AI_INSIGHTS, MOCK_CALENDAR_EVENTS, MOCK_TREND_TOPICS } from '../../../lib/api';
import { MetricCard, GlassPanel, PlatformBadge, StatusBadge } from '../../../components/ui';
import {
  Sparkles, Image as ImageIcon, Megaphone, UserCircle,
  ArrowRight, Clock, MessageSquare, TrendingUp,
  BarChart3, Send, Calendar, Lightbulb, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface DashboardData {
  recentAssets: { id: string; name: string; url: string; type: string; createdAt: string }[];
  recentCampaigns: { id: string; name: string; createdAt: string; status?: string }[];
  recentSessions: { id: string; title: string; createdAt: string }[];
  brandConfigured: boolean;
  stats: { totalAssets: number; totalCampaigns: number; totalCharacters: number; totalSessions: number };
}

const getQuickActions = (t: any) => [
  { icon: MessageSquare, label: t('Creative Chat'), desc: t('Chat with AI agents'), path: 'chat', color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20', iconColor: 'text-violet-400' },
  { icon: Megaphone, label: t('New Campaign'), desc: t('Launch a campaign'), path: 'campaigns', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/20', iconColor: 'text-orange-400' },
  { icon: FileText, label: t('Create Content'), desc: t('AI content production'), path: 'content', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20', iconColor: 'text-blue-400' },
  { icon: Send, label: t('Publish'), desc: t('Schedule & publish'), path: 'publisher', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20', iconColor: 'text-emerald-400' },
  { icon: UserCircle, label: t('Characters'), desc: t('AI character studio'), path: 'characters', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/20', iconColor: 'text-pink-400' },
  { icon: BarChart3, label: t('Analytics'), desc: t('Performance insights'), path: 'analytics', color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/20', iconColor: 'text-cyan-400' },
];

export function DashboardPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const promptRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const QUICK_ACTIONS = getQuickActions(t);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get<DashboardData>(`/api/tenants/${apiTenantId}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (tenantId) fetchDashboard();
  }, [tenantId]);

  const handleCreate = () => {
    if (prompt.trim()) {
      navigate(`/t/${tenantId}/visual/chat`, { state: { initialPrompt: prompt } });
    } else {
      navigate(`/t/${tenantId}/visual/chat`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good morning');
    if (hour < 18) return t('Good afternoon');
    return t('Good evening');
  };

  const metrics = MOCK_ANALYTICS_METRICS;
  const insights = MOCK_AI_INSIGHTS;
  const events = MOCK_CALENDAR_EVENTS;
  const trends = MOCK_TREND_TOPICS;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg animate-pulse" />
          </div>
          <div className="text-ink-muted font-medium text-sm">{t('Loading your creative workspace...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-8 relative">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-headings font-light tracking-wide text-white animate-fade-in">
              {getGreeting()}, Francisco
            </h1>
            <p className="text-sm text-ink-muted font-light">{t('What would you like to create today?')}</p>

            {/* Main Prompt Input */}
            <div className="max-w-2xl mx-auto mt-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <div className="relative flex items-center bg-paper border border-border-subtle rounded-xl overflow-hidden">
                  <input
                    ref={promptRef}
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder={t('Describe what you want to create...')}
                    className="flex-1 bg-transparent px-5 py-3.5 text-white placeholder:text-ink-muted/50 focus:outline-none text-sm"
                  />
                  <button onClick={handleCreate} className="m-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all">
                    <Sparkles className="w-4 h-4" /> {t('Create')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-10 space-y-8">
        {/* KPI Metrics */}
        <section className="animate-slide-up">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label={t('Reach')} value="124.5K" change={12.4} trend="up" sparkline={metrics[0].sparkline} />
            <MetricCard label={t('Published')} value={data?.stats?.totalAssets || 0} change={8.7} trend="up" />
            <MetricCard label={t('Campaigns')} value={data?.stats?.totalCampaigns || 0} icon={Megaphone} />
            <MetricCard label={t('Characters')} value={data?.stats?.totalCharacters || 0} icon={UserCircle} />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={`/t/${tenantId}/visual/${action.path}`}
                className={clsx(
                  'group relative p-4 rounded-xl bg-gradient-to-br border backdrop-blur-sm hover:scale-[1.03] transition-all duration-300',
                  action.color,
                )}
              >
                <div className={clsx('p-2 rounded-lg bg-white/10 w-fit mb-2', action.iconColor)}>
                  <action.icon className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-white text-xs">{action.label}</h3>
                <p className="text-[10px] text-ink-muted mt-0.5">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Upcoming + Activity */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upcoming Publications */}
            <GlassPanel className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t('Upcoming Publications')}
                </h2>
                <Link to={`/t/${tenantId}/visual/publisher`} className="text-[10px] text-primary hover:text-secondary transition-colors flex items-center gap-1">
                  {t('View All')} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {events.slice(0, 4).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <PlatformBadge platform={event.platform} showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{event.title}</p>
                      <p className="text-[10px] text-ink-muted">{format(new Date(event.date), 'MMM d')} {t('at')} {event.time}</p>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Recent Activity */}
            {data?.recentSessions && data.recentSessions.length > 0 && (
              <GlassPanel className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {t('Recent Activity')}
                  </h2>
                </div>
                <div className="space-y-2">
                  {data.recentSessions.slice(0, 3).map((session) => (
                    <Link key={session.id} to={`/t/${tenantId}/visual/chat`} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group">
                      <div className="p-1.5 rounded-md bg-primary/10"><MessageSquare className="w-3.5 h-3.5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{session.title || 'Creative Chat'}</p>
                        <p className="text-[10px] text-ink-muted">{new Date(session.createdAt).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </GlassPanel>
            )}
          </div>

          {/* Right: AI Recommendations + Trends */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendations */}
            <GlassPanel className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider">{t('AI Recommendations')}</h2>
              </div>
              <div className="space-y-2">
                {insights.slice(0, 3).map(insight => (
                  <div key={insight.id} className={clsx(
                    'p-3 rounded-lg border',
                    insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10' :
                    insight.type === 'opportunity' ? 'bg-blue-500/5 border-blue-500/10' :
                    insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/10' :
                    'bg-primary/5 border-primary/10',
                  )}>
                    <p className="text-xs text-white font-medium">{insight.title}</p>
                    <p className="text-[10px] text-ink-muted mt-1 line-clamp-2">{insight.description}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            {/* Trending Topics */}
            <GlassPanel className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> {t('Trending')}
                </h2>
                <Link to={`/t/${tenantId}/visual/trends`} className="text-[10px] text-primary hover:text-secondary transition-colors flex items-center gap-1">
                  {t('View All')} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {trends.slice(0, 3).map(trend => (
                  <div key={trend.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3">
                    <span className={clsx(
                      'text-xs font-headings font-bold',
                      trend.score >= 80 ? 'text-emerald-400' : 'text-amber-400',
                    )}>
                      {trend.score}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{trend.topic}</p>
                      <p className="text-[10px] text-ink-muted capitalize">{trend.velocity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Recent Assets */}
        {data?.recentAssets && data.recentAssets.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> {t('Recent Assets')}
              </h2>
              <Link to={`/t/${tenantId}/visual/library`} className="text-[10px] text-primary hover:text-secondary transition-colors flex items-center gap-1">
                {t('View All')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.recentAssets.slice(0, 6).map((asset) => (
                <div key={asset.id} className="group aspect-square rounded-xl overflow-hidden border border-border-subtle hover:border-primary/40 transition-all relative">
                  {asset.url ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-paper flex items-center justify-center"><ImageIcon className="w-6 h-6 text-ink-muted" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-medium truncate">{asset.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
