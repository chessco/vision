// ─── Publisher Studio Page ────────────────────────────────────────
// Social command center: Calendar, Queue, Approvals, Facebook integration.

import { useState } from 'react';
import { Send, Calendar, Clock, CheckSquare, Plus, Sparkles, RefreshCw, Link2, Unlink } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, StatusBadge, PlatformBadge, } from '../../../components/ui';
import { MOCK_CALENDAR_EVENTS, MOCK_SOCIAL_ACCOUNTS } from '../../../lib/api';
import clsx from 'clsx';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

type PublisherTab = 'calendar' | 'queue' | 'approvals' | 'accounts' | 'post-builder';

export function PublisherStudioPage() {
  const [activeTab, setActiveTab] = useState<PublisherTab>('calendar');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const events = MOCK_CALENDAR_EVENTS;
  const accounts = MOCK_SOCIAL_ACCOUNTS;

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'queue', label: 'Queue', icon: Clock, count: events.filter(e => e.status === 'scheduled').length },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, count: events.filter(e => e.status === 'pending_review').length },
    { id: 'accounts', label: 'Accounts', icon: Link2 },
    { id: 'post-builder', label: 'Post Builder', icon: Plus },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Send}
        title="Publisher Studio"
        description="Your social command center. Schedule, approve, and publish content across all platforms."
        actions={
          <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm">
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        }
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as PublisherTab)} />

      {activeTab === 'calendar' && (
        <GlassPanel className="p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-headings font-semibold text-white">Publishing Calendar</h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-ink-muted hover:text-white transition-colors">← Prev</button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">Today</button>
              <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-ink-muted hover:text-white transition-colors">Next →</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = addDays(currentWeekStart, i);
              const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
              const isToday = isSameDay(day, new Date());
              return (
                <div key={i} className={clsx('rounded-xl border p-3 min-h-[140px]', isToday ? 'border-primary/30 bg-primary/5' : 'border-border-subtle bg-white/2')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx('text-xs font-labels', isToday ? 'text-primary font-semibold' : 'text-ink-muted')}>{format(day, 'EEE')}</span>
                    <span className={clsx('text-sm font-medium', isToday ? 'text-primary' : 'text-white')}>{format(day, 'd')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map(event => (
                      <div key={event.id} className="px-2 py-1.5 rounded-md bg-white/5 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer">
                        <p className="text-[10px] text-white font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <PlatformBadge platform={event.platform} showLabel={false} />
                          <span className="text-[9px] text-ink-muted">{event.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-3 stagger-children">
          {events.filter(e => e.status === 'scheduled' || e.status === 'approved').map(event => (
            <GlassPanel key={event.id} className="p-4 flex items-center gap-4" hover>
              <PlatformBadge platform={event.platform} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{event.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">{format(new Date(event.date), 'MMM d, yyyy')} at {event.time}</p>
              </div>
              <StatusBadge status={event.status} />
              <div className="flex gap-1">
                <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-ink-muted hover:text-white hover:bg-white/10 transition-colors">Edit</button>
                <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Publish Now</button>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6 animate-fade-in">
          {/* Approval Pipeline */}
          <GlassPanel className="p-6">
            <h3 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider mb-4">Approval Pipeline</h3>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {['Generated', 'Human Review', 'Compliance', 'Approved', 'Scheduled', 'Published'].map((stage, i) => (
                <div key={stage} className="flex items-center gap-2 shrink-0">
                  <div className={clsx(
                    'px-4 py-2 rounded-lg border text-xs font-medium',
                    i <= 1 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/3 border-white/5 text-ink-muted',
                  )}>
                    {stage}
                  </div>
                  {i < 5 && <span className="text-ink-muted/30">→</span>}
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Pending Approvals */}
          <div className="space-y-3 stagger-children">
            {events.filter(e => e.status === 'pending_review' || e.status === 'draft').map(event => (
              <GlassPanel key={event.id} className="p-4 flex items-center gap-4" hover>
                <PlatformBadge platform={event.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{event.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">Scheduled: {format(new Date(event.date), 'MMM d')} at {event.time}</p>
                </div>
                <StatusBadge status={event.status} />
                <div className="flex gap-1">
                  <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">Reject</button>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">Approve</button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-4 stagger-children">
          {accounts.map(account => (
            <GlassPanel key={account.id} className="p-5 space-y-4" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={account.platform} />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{account.accountName}</h3>
                    <p className="text-xs text-ink-muted mt-0.5">Connected {format(new Date(account.connectedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={account.status} />
                  {account.status === 'expired' ? (
                    <button className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Refresh Token
                    </button>
                  ) : (
                    <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                      <Unlink className="w-3 h-3" /> Disconnect
                    </button>
                  )}
                </div>
              </div>
              {account.tokenExpiresAt && (
                <p className="text-[10px] text-ink-muted">Token expires: {format(new Date(account.tokenExpiresAt), 'MMM d, yyyy')}</p>
              )}
              <div className="space-y-2">
                <span className="text-[10px] font-labels text-ink-muted uppercase tracking-wider">Pages</span>
                {account.pages.map(page => (
                  <div key={page.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className={page.connected ? 'text-emerald-400' : 'text-ink-muted'}>
                        {page.connected ? '✓' : '○'}
                      </span>
                      <span className="text-sm text-white">{page.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {page.assignedBrandId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Brand Linked</span>}
                      {page.assignedCampaignIds.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{page.assignedCampaignIds.length} Campaign{page.assignedCampaignIds.length > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          ))}

          <button className="w-full p-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-primary/40 flex items-center justify-center gap-2 text-ink-muted hover:text-primary transition-colors">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Connect New Account</span>
          </button>
        </div>
      )}

      {activeTab === 'post-builder' && (
        <GlassPanel className="p-6 animate-fade-in">
          <div className="space-y-4">
            <h3 className="text-lg font-headings font-semibold text-white">Facebook Post Builder</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-muted">Post Type</label>
                  <div className="flex gap-2">
                    {['Text', 'Image', 'Carousel', 'Video', 'Reel', 'Link'].map(type => (
                      <button key={type} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-ink-muted hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10 transition-colors">{type}</button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Write your post content..." rows={6} className="w-full bg-background border border-border-subtle rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> AI Generate</button>
                  <button className="flex-1 py-2 rounded-lg bg-secondary/10 text-secondary text-sm font-medium hover:bg-secondary/20 transition-colors">Humanize</button>
                  <button className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors">Schedule</button>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <span className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">Facebook Preview</span>
                <div className="border border-border-subtle rounded-xl overflow-hidden bg-[#242526]">
                  <div className="p-3 flex items-center gap-3 border-b border-[#3a3b3c]">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">A</div>
                    <div>
                      <p className="text-sm text-white font-semibold">AAA Abogados</p>
                      <p className="text-[11px] text-[#b0b3b8]">Just now · 🌐</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-[#e4e6eb]">Your post will appear here...</p>
                  </div>
                  <div className="aspect-video bg-[#3a3b3c] flex items-center justify-center">
                    <span className="text-xs text-[#b0b3b8]">Image preview area</span>
                  </div>
                  <div className="p-3 border-t border-[#3a3b3c] flex justify-around">
                    {['👍 Like', '💬 Comment', '↗️ Share'].map(action => (
                      <button key={action} className="text-xs text-[#b0b3b8] hover:text-white transition-colors py-1 px-3">{action}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
