// ─── Optimization Studio Page ────────────────────────────────────
// AI-powered optimization recommendations, A/B testing, and content suggestions.

import { useState } from 'react';
import { Lightbulb, ArrowUpRight, Beaker, Target, BarChart3, Zap } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, EmptyState } from '../../../components/ui';
import { MOCK_OPTIMIZATION_RECOMMENDATIONS } from '../../../lib/api';
import clsx from 'clsx';

type OptimizationTab = 'recommendations' | 'ab-testing' | 'suggestions' | 'roi';

export function OptimizationStudioPage() {
  const [activeTab, setActiveTab] = useState<OptimizationTab>('recommendations');
  const recommendations = MOCK_OPTIMIZATION_RECOMMENDATIONS;

  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, count: recommendations.filter(r => r.status === 'pending').length },
    { id: 'ab-testing', label: 'A/B Testing', icon: Beaker },
    { id: 'suggestions', label: 'Content Ideas', icon: Zap },
    { id: 'roi', label: 'ROI Optimization', icon: BarChart3 },
  ];

  const impactColor = (impact: string) => impact === 'high' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : impact === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  const effortColor = (effort: string) => effort === 'low' ? 'text-emerald-400' : effort === 'medium' ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Lightbulb}
        title="Optimization Studio"
        description="AI-driven recommendations to improve your content performance and maximize ROI."
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as OptimizationTab)} />

      {activeTab === 'recommendations' && (
        <div className="space-y-4 stagger-children">
          {/* Summary */}
          <GlassPanel className="p-5 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">AI Optimization Score</h3>
                <p className="text-xs text-ink-muted mt-0.5">Your content strategy can improve by an estimated 35% with these recommendations.</p>
              </div>
              <div className="text-3xl font-headings font-bold text-primary">65<span className="text-lg text-ink-muted">/100</span></div>
            </div>
          </GlassPanel>

          {recommendations.map((rec) => (
            <GlassPanel key={rec.id} className="p-5" hover>
              <div className="flex items-start gap-4">
                <div className={clsx('p-2 rounded-lg shrink-0', rec.type === 'timing' ? 'bg-blue-500/10 text-blue-400' : rec.type === 'content' ? 'bg-primary/10 text-primary' : rec.type === 'channel' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                  {rec.type === 'timing' ? <Target className="w-5 h-5" /> : rec.type === 'content' ? <Lightbulb className="w-5 h-5" /> : rec.type === 'channel' ? <BarChart3 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                    <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase', impactColor(rec.impact))}>
                      {rec.impact} impact
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">{rec.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] text-ink-muted">Effort: <span className={effortColor(rec.effort)}>{rec.effort}</span></span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1 shrink-0">
                  Apply <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'ab-testing' && (
        <GlassPanel className="p-6 animate-fade-in">
          <EmptyState icon={Beaker} title="A/B Testing" description="Create split tests for your content to find what resonates best with your audience." action={{ label: 'Create A/B Test', onClick: () => {} }} />
        </GlassPanel>
      )}

      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {[
            { title: 'Behind-the-Scenes Content', desc: 'Show your team\'s daily work process. Authenticity drives 2.4x more engagement.', platform: 'Instagram', urgency: 'This week' },
            { title: 'Customer Success Story', desc: 'Feature a recent client win. Case studies convert 34% better than product posts.', platform: 'LinkedIn', urgency: 'Next 3 days' },
            { title: 'Industry Trend Commentary', desc: 'Share your expert perspective on AI in legal tech. Thought leadership builds authority.', platform: 'LinkedIn', urgency: 'Today' },
            { title: 'Quick Tips Carousel', desc: 'Create a 5-slide carousel with actionable tips. Carousels get 3.1x more shares.', platform: 'Instagram', urgency: 'This week' },
            { title: 'Video Testimonial', desc: 'Record a 30-second client testimonial. Video drives 28% more engagement.', platform: 'Facebook', urgency: 'Next 5 days' },
            { title: 'Poll / Question Post', desc: 'Ask your audience about their biggest challenge. Interactive posts boost engagement by 40%.', platform: 'Facebook', urgency: 'Tomorrow' },
          ].map((suggestion, i) => (
            <GlassPanel key={i} className="p-5 space-y-3" hover>
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-white">{suggestion.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">{suggestion.urgency}</span>
              </div>
              <p className="text-xs text-ink-muted">{suggestion.desc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <span className="text-[10px] text-ink-muted">Best for: <span className="text-white">{suggestion.platform}</span></span>
                <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors">Create Now</button>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'roi' && (
        <GlassPanel className="p-6 animate-fade-in">
          <EmptyState icon={BarChart3} title="ROI Optimization" description="Track and optimize your return on investment across campaigns and channels." action={{ label: 'Configure ROI Tracking', onClick: () => {} }} />
        </GlassPanel>
      )}
    </div>
  );
}
