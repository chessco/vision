// ─── Campaign Studio Page ────────────────────────────────────────
// Campaign management with dashboard, wizard, and calendar views.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Megaphone, Plus, Calendar, LayoutGrid, Target, Trash2, BarChart3 } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, EmptyState, StatusBadge, MetricCard, LoadingSpinner } from '../../../components/ui';
import { toApiTenantId, MOCK_CALENDAR_EVENTS } from '../../../lib/api';
import clsx from 'clsx';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

type CampaignTab = 'dashboard' | 'campaigns' | 'calendar' | 'planner';

interface CampaignData {
  id: string;
  name: string;
  objective: string;
  audience: string;
  status: string;
  createdAt: string;
  assets: { id: string; url: string; type: string }[];
}

export function CampaignStudioPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [activeTab, setActiveTab] = useState<CampaignTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(`/api/tenants/${apiTenantId}/campaigns`);
        setCampaigns(res.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [apiTenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign and all its assets?')) return;
    try {
      await axios.delete(`/api/tenants/${apiTenantId}/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: campaigns.length },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'planner', label: 'Planner', icon: Target },
  ];

  if (loading) return <LoadingSpinner label="Loading campaign studio..." fullPage />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Megaphone}
        title="Campaign Studio"
        description="Plan, create, and manage marketing campaigns with AI-powered strategy."
        actions={
          <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm">
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        }
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as CampaignTab)} />

      {activeTab === 'dashboard' && (
        <div className="space-y-6 stagger-children">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Active" value={campaigns.filter(c => c.status !== 'archived').length} icon={Megaphone} />
            <MetricCard label="Total Assets" value={campaigns.reduce((sum, c) => sum + (c.assets?.length || 0), 0)} icon={BarChart3} />
            <MetricCard label="This Month" value={campaigns.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length} icon={Calendar} />
            <MetricCard label="Avg. Assets" value={campaigns.length ? Math.round(campaigns.reduce((sum, c) => sum + (c.assets?.length || 0), 0) / campaigns.length) : 0} icon={Target} />
          </div>

          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {campaigns.slice(0, 4).map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <GlassPanel className="p-6">
              <EmptyState icon={Megaphone} title="No campaigns yet" description="Create your first campaign to start organizing your creative content." action={{ label: 'Create Campaign', onClick: () => {} }} />
            </GlassPanel>
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-4 stagger-children">
          {campaigns.length === 0 ? (
            <GlassPanel className="p-6">
              <EmptyState icon={Megaphone} title="No campaigns yet" description="Go to Creative Chat and approve a design to create your first campaign." />
            </GlassPanel>
          ) : (
            campaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <GlassPanel className="p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-headings font-semibold text-white">
              Week of {format(currentWeekStart, 'MMM d, yyyy')}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-ink-muted hover:text-white transition-colors">← Prev</button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Today</button>
              <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-ink-muted hover:text-white transition-colors">Next →</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = addDays(currentWeekStart, i);
              const dayEvents = MOCK_CALENDAR_EVENTS.filter(e => isSameDay(new Date(e.date), day));
              const isToday = isSameDay(day, new Date());
              return (
                <div key={i} className={clsx('rounded-xl border p-3 min-h-[120px]', isToday ? 'border-primary/30 bg-primary/5' : 'border-border-subtle bg-white/2')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx('text-xs font-labels', isToday ? 'text-primary font-semibold' : 'text-ink-muted')}>{format(day, 'EEE')}</span>
                    <span className={clsx('text-sm font-medium', isToday ? 'text-primary' : 'text-white')}>{format(day, 'd')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map(event => (
                      <div key={event.id} className="px-2 py-1.5 rounded-md bg-white/5 border border-white/5">
                        <p className="text-[10px] text-white font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-ink-muted">{event.time}</span>
                          <StatusBadge status={event.status} size="sm" />
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

      {activeTab === 'planner' && (
        <GlassPanel className="p-6 animate-fade-in">
          <EmptyState icon={Target} title="Campaign Planner" description="Strategic planning with AI-powered campaign recommendations and timeline visualization." action={{ label: 'Start Planning', onClick: () => {} }} />
        </GlassPanel>
      )}
    </div>
  );
}

function CampaignCard({ campaign, onDelete }: { campaign: CampaignData; onDelete: (id: string) => void }) {
  return (
    <GlassPanel className="p-5 space-y-3 group" hover>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-headings font-semibold text-white">{campaign.name}</h3>
          <div className="flex items-center gap-3 text-xs text-ink-muted mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(campaign.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3" />{campaign.audience}</span>
          </div>
        </div>
        <button onClick={() => onDelete(campaign.id)} className="text-ink-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 rounded-lg bg-background border border-border-subtle">
        <span className="text-[10px] text-ink-muted uppercase font-labels tracking-wider">Objective</span>
        <p className="text-sm text-white mt-1 line-clamp-2">{campaign.objective}</p>
      </div>
      {campaign.assets && campaign.assets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {campaign.assets.slice(0, 4).map(asset => (
            <div key={asset.id} className="w-16 h-16 rounded-lg border border-border-subtle overflow-hidden shrink-0">
              <img src={asset.url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ))}
          {campaign.assets.length > 4 && (
            <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-ink-muted shrink-0">
              +{campaign.assets.length - 4}
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
