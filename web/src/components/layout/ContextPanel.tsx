// ─── Context Panel ───────────────────────────────────────────────
// Right panel showing contextual information based on current route.

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  PanelRightClose, PanelRightOpen, Brain, Sparkles,
  Target, Image, TrendingUp, Clock, Users,
} from 'lucide-react';

interface ContextItem {
  icon: typeof Brain;
  label: string;
  value: string;
  color?: string;
}

export function ContextPanel() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] || 'dashboard';

  // Context items based on current page
  const getContextItems = (): ContextItem[] => {
    const base: ContextItem[] = [
      { icon: Brain, label: 'Active Agent', value: 'Creative Director', color: 'text-primary' },
      { icon: Target, label: 'Active Campaign', value: 'Q3 Brand Awareness', color: 'text-secondary' },
    ];

    if (currentPage === 'chat') {
      return [
        ...base,
        { icon: Users, label: 'Brand Memory', value: '12 entries' },
        { icon: Users, label: 'Audience Memory', value: '8 insights' },
      ];
    }
    if (currentPage === 'publisher' || currentPage === 'content') {
      return [
        ...base,
        { icon: Clock, label: 'Scheduled', value: '5 posts' },
        { icon: TrendingUp, label: 'Best Time', value: '9-11 AM' },
      ];
    }
    return base;
  };

  const suggestions = [
    'Create a storytelling post about company values',
    'Schedule a behind-the-scenes reel for Thursday',
    'A/B test your CTA with the word "discover"',
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 p-2 bg-paper border border-border-subtle border-r-0 rounded-l-lg text-ink-muted hover:text-primary transition-colors z-30"
        title="Open context panel"
      >
        <PanelRightOpen className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside className={clsx(
      'w-[280px] h-full border-l border-border-subtle bg-[#0d0b14]/90 backdrop-blur-xl flex flex-col shrink-0',
      'animate-in slide-in-from-right duration-200',
    )}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
        <span className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">Context</span>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-md hover:bg-white/5 text-ink-muted hover:text-white transition-colors"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Context Items */}
        <div className="space-y-2">
          {getContextItems().map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
              <item.icon className={clsx('w-4 h-4 shrink-0', item.color || 'text-ink-muted')} />
              <div className="min-w-0">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-white font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-labels font-semibold text-ink-muted uppercase tracking-wider">AI Suggestions</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="w-full text-left p-2.5 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 text-xs text-ink-muted hover:text-white transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Assets */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[10px] font-labels font-semibold text-ink-muted uppercase tracking-wider">Recent Assets</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-md bg-white/5 border border-white/5 flex items-center justify-center">
                <Image className="w-4 h-4 text-ink-muted/30" />
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-labels font-semibold text-ink-muted uppercase tracking-wider">Performance</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">Engagement Rate</span>
              <span className="text-emerald-400 font-medium">8.4%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">Avg. Reach</span>
              <span className="text-white font-medium">12.4K</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">Best Channel</span>
              <span className="text-blue-400 font-medium">Facebook</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
