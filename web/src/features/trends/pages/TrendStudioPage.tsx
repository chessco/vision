// ─── Trend Studio Page ───────────────────────────────────────────
// Trending topics, hashtags, competitor analysis, and opportunity scores.

import { useState } from 'react';
import { TrendingUp, Hash, Eye, Globe, Gauge, ArrowUpRight, ArrowRight, Minus } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar } from '../../../components/ui';
import { MOCK_TREND_TOPICS } from '../../../lib/api';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

type TrendTab = 'topics' | 'hashtags' | 'competitors' | 'industry' | 'regional';

export function TrendStudioPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TrendTab>('topics');
  const trends = MOCK_TREND_TOPICS;

  const tabs = [
    { id: 'topics', label: t('Trending Topics'), icon: TrendingUp },
    { id: 'hashtags', label: t('Hashtags'), icon: Hash },
    { id: 'competitors', label: t('Competitors'), icon: Eye },
    { id: 'industry', label: t('Industry'), icon: Globe },
    { id: 'regional', label: t('Regional'), icon: Globe },
  ];

  const velocityIcon = (v: string) => v === 'rising' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : v === 'declining' ? <ArrowRight className="w-3.5 h-3.5 text-red-400 rotate-45" /> : <Minus className="w-3.5 h-3.5 text-ink-muted" />;
  const velocityColor = (v: string) => v === 'rising' ? 'text-emerald-400' : v === 'declining' ? 'text-red-400' : 'text-ink-muted';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={TrendingUp}
        title={t('Trend Studio')}
        description={t('Monitor trending topics, hashtags, and competitor activity to stay ahead of the curve.')}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TrendTab)} />

      {activeTab === 'topics' && (
        <div className="space-y-4 stagger-children">
          {trends.map((trend, i) => (
            <GlassPanel key={trend.id} className="p-5" hover>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-headings font-bold text-sm shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{trend.topic}</h3>
                    <div className="flex items-center gap-1">
                      {velocityIcon(trend.velocity)}
                      <span className={clsx('text-[10px] font-medium capitalize', velocityColor(trend.velocity))}>{trend.velocity}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {trend.hashtags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-ink-muted" />
                    <span className="text-xs text-ink-muted">{t('Opportunity')}</span>
                  </div>
                  <span className={clsx(
                    'text-xl font-headings font-bold',
                    trend.score >= 80 ? 'text-emerald-400' : trend.score >= 60 ? 'text-amber-400' : 'text-ink-muted',
                  )}>
                    {trend.score}
                  </span>
                </div>
                {trend.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-ink-muted border border-white/5 shrink-0">{trend.category}</span>
                )}
                <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shrink-0 flex items-center gap-1">
                  {t('Create')} <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div className="space-y-4 stagger-children">
          <GlassPanel className="p-6">
            <h3 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider mb-4">{t('Trending Hashtags')}</h3>
            <div className="flex flex-wrap gap-2">
              {trends.flatMap(t => t.hashtags).map((tag, i) => (
                <button key={`${tag}-${i}`} className={clsx(
                  'px-3 py-2 rounded-lg border transition-all hover:scale-105',
                  i < 3 ? 'bg-primary/10 border-primary/20 text-primary text-sm font-medium' :
                  i < 6 ? 'bg-white/5 border-white/10 text-white text-sm' :
                  'bg-white/3 border-white/5 text-ink-muted text-xs',
                )}>
                  {tag}
                </button>
              ))}
            </div>
          </GlassPanel>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { label: t('Most Used Today'), tags: ['#AIMarketing', '#ContentCreation', '#SocialMedia'], color: 'primary' },
              { label: t('Rising Fast'), tags: ['#LegalTech', '#BlueEconomy', '#Sustainability'], color: 'emerald' },
              { label: t('Your Best Performers'), tags: ['#MarTech', '#GreenBusiness', '#Reels'], color: 'amber' },
            ].map((group, i) => (
              <GlassPanel key={i} className="p-5 space-y-3">
                <h4 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">{group.label}</h4>
                <div className="space-y-2">
                  {group.tags.map((tag, j) => (
                    <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-white/3">
                      <span className="text-sm text-white">{tag}</span>
                      <span className="text-[10px] text-ink-muted">#{j + 1}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {[
            { name: 'Competitor A', posts: 24, engagement: 6.2, topContent: 'Video testimonials', trend: 'up' },
            { name: 'Competitor B', posts: 18, engagement: 4.8, topContent: 'Industry reports', trend: 'stable' },
            { name: 'Competitor C', posts: 31, engagement: 8.1, topContent: 'Behind-the-scenes', trend: 'up' },
            { name: 'Competitor D', posts: 12, engagement: 3.4, topContent: 'Product updates', trend: 'down' },
          ].map((comp, i) => (
            <GlassPanel key={i} className="p-5 space-y-3" hover>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{comp.name}</h3>
                <div className="flex items-center gap-1">
                  {velocityIcon(comp.trend === 'up' ? 'rising' : comp.trend === 'down' ? 'declining' : 'stable')}
                  <span className={clsx('text-[10px] capitalize', velocityColor(comp.trend === 'up' ? 'rising' : comp.trend === 'down' ? 'declining' : 'stable'))}>{comp.trend}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-[10px] text-ink-muted">{t('Posts/mo')}</p><p className="text-lg text-white font-medium">{comp.posts}</p></div>
                <div><p className="text-[10px] text-ink-muted">{t('Engagement')}</p><p className="text-lg text-white font-medium">{comp.engagement}%</p></div>
                <div><p className="text-[10px] text-ink-muted">{t('Top Content')}</p><p className="text-xs text-white">{comp.topContent}</p></div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'industry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {[
            { trend: 'AI-First Content Creation', adoption: 72, growth: '+34%', desc: 'Businesses using AI for content see 2.4x faster production.' },
            { trend: 'Video-Dominant Strategy', adoption: 65, growth: '+28%', desc: 'Short-form video is now the primary content format across platforms.' },
            { trend: 'Personalization at Scale', adoption: 48, growth: '+41%', desc: 'AI-driven personalization increases conversion by 35%.' },
            { trend: 'Social Commerce Integration', adoption: 38, growth: '+52%', desc: 'Direct sales through social platforms are growing rapidly.' },
          ].map((item, i) => (
            <GlassPanel key={i} className="p-5 space-y-3" hover>
              <h4 className="text-sm font-semibold text-white">{item.trend}</h4>
              <p className="text-xs text-ink-muted">{item.desc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div>
                  <span className="text-[10px] text-ink-muted">{t('Adoption:')}</span>
                  <span className="text-sm text-white font-medium ml-1">{item.adoption}%</span>
                </div>
                <span className="text-sm text-emerald-400 font-medium">{item.growth}</span>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'regional' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 stagger-children">
          {[
            { region: 'Mexico', topics: ['AI en Marketing', 'Comercio Digital', 'Fintech'], score: 88 },
            { region: 'Latin America', topics: ['E-commerce Growth', 'Mobile-First', 'Social Selling'], score: 82 },
            { region: 'United States', topics: ['AI Regulation', 'Creator Economy', 'B2B Marketing'], score: 76 },
            { region: 'Europe', topics: ['GDPR Compliance', 'Sustainability', 'Digital Identity'], score: 71 },
            { region: 'Asia Pacific', topics: ['Super Apps', 'Live Commerce', 'AI Assistants'], score: 85 },
            { region: 'Global', topics: ['Climate Tech', 'Remote Work', 'Mental Health'], score: 79 },
          ].map((region, i) => (
            <GlassPanel key={i} className="p-5 space-y-3" hover>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">{region.region}</h4>
                <span className={clsx('text-lg font-headings font-bold', region.score >= 80 ? 'text-emerald-400' : 'text-amber-400')}>{region.score}</span>
              </div>
              <div className="space-y-1.5">
                {region.topics.map((topic, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {topic}
                  </div>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
