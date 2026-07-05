// ─── Content Studio Page ─────────────────────────────────────────
// AI production workspace: Brief → Generate → Humanize → Compare → Publish

import { useState } from 'react';
import { FileText, Sparkles, Plus, Wand2, Columns, ShieldCheck } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, StatusBadge, ScoreBar, PlatformBadge } from '../../../components/ui';
import clsx from 'clsx';

type ContentTab = 'workspace' | 'humanizer' | 'comparison' | 'compliance';

export function ContentStudioPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>('workspace');
  const [brief, setBrief] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);

  const platforms = ['facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'whatsapp'];

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: FileText },
    { id: 'humanizer', label: 'Humanizer', icon: Wand2 },
    { id: 'comparison', label: 'Compare', icon: Columns },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  ];

  // Mock generated content versions
  const versions = [
    { id: 'A', label: 'Version A', text: 'Just a few years ago, these tasks required entire teams. Today, a small business can automate them with AI — saving hours every week while delivering consistent, professional results.', selected: true },
    { id: 'B', label: 'Version B', text: 'What used to take a whole marketing department now fits in your pocket. AI-powered tools are transforming how small businesses create content, manage campaigns, and connect with their audience.', selected: false },
    { id: 'C', label: 'Version C', text: 'Imagine having a creative director, copywriter, and social media manager — all working around the clock. That\'s what AI brings to your business, and it\'s more accessible than you think.', selected: false },
    { id: 'D', label: 'Version D', text: 'The future of marketing isn\'t about bigger budgets. It\'s about smarter tools. AI empowers small businesses to compete with industry giants, one brilliant piece of content at a time.', selected: false },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={FileText}
        title="Content Studio"
        description="AI-powered content production workspace. Generate, humanize, review, and publish across platforms."
        actions={
          <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm">
            <Plus className="w-4 h-4" />
            New Brief
          </button>
        }
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as ContentTab)} />

      {activeTab === 'workspace' && (
        <div className="space-y-6 stagger-children">
          {/* Brief Editor */}
          <GlassPanel className="p-6 space-y-4">
            <h3 className="text-lg font-headings font-semibold text-white">Content Brief</h3>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe the content you want to create. e.g. 'Create a Facebook post promoting our new legal consulting service for small businesses. Tone should be professional yet approachable. Include a strong CTA.'"
              rows={4}
              className="w-full bg-background border border-border-subtle rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {platforms.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                      selectedPlatforms.includes(p)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-white/5 text-ink-muted border border-white/5 hover:border-white/10',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all text-sm">
                <Sparkles className="w-4 h-4" />
                Generate Content
              </button>
            </div>
          </GlassPanel>

          {/* Generated Content Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedPlatforms.map(platform => (
              <GlassPanel key={platform} className="p-5 space-y-3" hover>
                <div className="flex items-center justify-between">
                  <PlatformBadge platform={platform} />
                  <StatusBadge status="generated" />
                </div>
                <p className="text-sm text-white leading-relaxed">{versions[0].text}</p>
                <div className="flex gap-2 pt-2 border-t border-border-subtle">
                  <button className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Humanize</button>
                  <button className="flex-1 py-1.5 rounded-lg bg-white/5 text-ink-muted text-xs font-medium hover:bg-white/10 hover:text-white transition-colors">Edit</button>
                  <button className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">Approve</button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'humanizer' && (
        <div className="space-y-6 stagger-children">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Before */}
            <GlassPanel className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] font-labels font-semibold uppercase tracking-wider">Before</div>
                <span className="text-xs text-ink-muted">AI Generated</span>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed italic">
                "The implementation of artificial intelligence significantly improves productivity metrics across all operational departments, enabling organizations to achieve optimal resource allocation and enhanced workflow efficiency."
              </p>
            </GlassPanel>

            {/* After */}
            <GlassPanel className="p-6 space-y-4" glow="cyan">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-labels font-semibold uppercase tracking-wider">After</div>
                <span className="text-xs text-ink-muted">Humanized</span>
              </div>
              <p className="text-sm text-white leading-relaxed">
                "Just a few years ago, these tasks required entire teams. Today, a small business can automate them with AI — saving hours every week while delivering consistent, professional results."
              </p>
            </GlassPanel>
          </div>

          {/* Scores */}
          <GlassPanel className="p-6 space-y-4">
            <h3 className="text-lg font-headings font-semibold text-white">Content Scores</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <ScoreBar label="Human Score" value={92} color="emerald" />
              <ScoreBar label="Emotion Score" value={78} color="amber" />
              <ScoreBar label="Authenticity Score" value={85} color="cyan" />
              <ScoreBar label="Brand Score" value={88} color="primary" />
            </div>
          </GlassPanel>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {versions.map(v => (
              <GlassPanel key={v.id} className={clsx('p-4 space-y-3 cursor-pointer transition-all', v.selected ? 'border-primary/40 glow-purple' : '')} hover>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-labels font-semibold text-primary uppercase tracking-wider">{v.label}</span>
                  {v.selected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Selected</span>}
                </div>
                <p className="text-xs text-white leading-relaxed">{v.text}</p>
                <button className={clsx(
                  'w-full py-1.5 rounded-lg text-xs font-medium transition-all',
                  v.selected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-ink-muted hover:bg-primary/10 hover:text-primary',
                )}>
                  {v.selected ? '✓ Selected' : 'Select'}
                </button>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <GlassPanel className="p-6 animate-fade-in">
          <div className="space-y-4">
            <h3 className="text-lg font-headings font-semibold text-white">Compliance Review</h3>
            <div className="space-y-3">
              {[
                { label: 'Brand Voice Alignment', status: 'pass', detail: 'Content matches brand tone guidelines' },
                { label: 'Forbidden Terms Check', status: 'pass', detail: 'No forbidden terms detected' },
                { label: 'Legal Compliance', status: 'pass', detail: 'No legal issues found' },
                { label: 'Platform Guidelines', status: 'warning', detail: 'Post length exceeds LinkedIn optimal (150 chars over)' },
                { label: 'Accessibility', status: 'pass', detail: 'Alt text provided for all images' },
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <div className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    check.status === 'pass' ? 'bg-emerald-400' : check.status === 'warning' ? 'bg-amber-400' : 'bg-red-400',
                  )} />
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium">{check.label}</span>
                    <p className="text-xs text-ink-muted mt-0.5">{check.detail}</p>
                  </div>
                  <StatusBadge status={check.status} />
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
