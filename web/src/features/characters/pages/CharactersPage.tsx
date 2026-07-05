// ─── Character Studio Page ────────────────────────────────────────
// Enhanced character profiles, performance metrics, and configuration.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { UserCircle, Plus, Settings, Brain, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { PageHeader, GlassPanel, StatusBadge, EmptyState, LoadingSpinner } from '../../../components/ui';
import { toApiTenantId } from '../../../lib/api';
import type { Character } from '../../../types';
import clsx from 'clsx';

export function CharactersPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await axios.get(`/api/tenants/${apiTenantId}/characters`);
        setCharacters(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      } catch (err) {
        console.error('Error fetching characters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, [apiTenantId]);

  if (loading) return <LoadingSpinner label="Loading Character Studio..." fullPage />;

  const selected = characters.find(c => c.id === selectedId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in flex flex-col h-full">
      <PageHeader
        icon={UserCircle}
        title="Character Studio"
        description="Create, train, and manage AI personas to interact with your audience and generate consistent content."
        actions={
          <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm">
            <Plus className="w-4 h-4" />
            New Character
          </button>
        }
      />

      {characters.length === 0 ? (
        <GlassPanel className="p-12">
          <EmptyState
            icon={UserCircle}
            title="No Characters Yet"
            description="Create your first AI character to start automating your brand communication."
            action={{ label: 'Create Character', onClick: () => {} }}
          />
        </GlassPanel>
      ) : (
        <div className="flex gap-6 flex-1 min-h-[500px]">
          {/* Sidebar List */}
          <div className="w-[300px] shrink-0 space-y-3">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => setSelectedId(char.id)}
                className={clsx(
                  'w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3',
                  selectedId === char.id
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
                )}
              >
                {char.avatarUrl ? (
                  <img src={char.avatarUrl} alt={char.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={clsx('text-sm font-semibold truncate', selectedId === char.id ? 'text-primary' : 'text-white')}>{char.name}</h3>
                  <p className="text-[10px] text-ink-muted truncate mt-0.5">{char.type} · {char.industry}</p>
                </div>
                <StatusBadge status={char.status} size="sm" />
              </button>
            ))}
          </div>

          {/* Character Profile Detail */}
          {selected && (
            <GlassPanel className="flex-1 p-0 overflow-hidden flex flex-col">
              <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-b border-border-subtle relative">
                <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                  {selected.avatarUrl ? (
                    <img src={selected.avatarUrl} alt={selected.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-paper shadow-xl" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-paper border-4 border-paper flex items-center justify-center shadow-xl">
                      <UserCircle className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div className="mb-2">
                    <h2 className="text-2xl font-headings font-bold text-white">{selected.name}</h2>
                    <p className="text-sm text-ink-muted">{selected.type} | {selected.industry}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 rounded-lg bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"><Settings className="w-4 h-4" /></button>
                  <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                </div>
              </div>

              <div className="mt-14 px-8 pb-8 flex-1 overflow-y-auto space-y-8">
                {/* Core Config */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider mb-2">Personality</h3>
                    <p className="text-sm text-white leading-relaxed">{selected.personality}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider mb-2">Mission</h3>
                    <p className="text-sm text-white leading-relaxed">{selected.mission}</p>
                  </div>
                </div>

                {/* Performance Stats */}
                <div>
                  <h3 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider mb-3">Performance</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-[10px] text-ink-muted uppercase">Interactions</p>
                      <p className="text-xl font-headings font-bold text-white mt-1">1,248</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-[10px] text-ink-muted uppercase">Engagement</p>
                      <p className="text-xl font-headings font-bold text-emerald-400 mt-1">8.4%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-[10px] text-ink-muted uppercase">Accuracy</p>
                      <p className="text-xl font-headings font-bold text-white mt-1">96%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-[10px] text-ink-muted uppercase">Status</p>
                      <div className="mt-1"><StatusBadge status={selected.status} /></div>
                    </div>
                  </div>
                </div>

                {/* Training Memory & Visuals */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <Brain className="w-4 h-4" />
                      <h3 className="text-xs font-labels font-semibold uppercase tracking-wider">Memory & Knowledge</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-2 text-sm text-white">
                      <div className="flex justify-between items-center"><span className="text-ink-muted">Brand Guidelines</span><span className="text-emerald-400 text-xs">Active</span></div>
                      <div className="flex justify-between items-center"><span className="text-ink-muted">Product Catalog</span><span className="text-emerald-400 text-xs">Active</span></div>
                      <div className="flex justify-between items-center"><span className="text-ink-muted">Past Interactions</span><span className="text-emerald-400 text-xs">Learning</span></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <ImageIcon className="w-4 h-4" />
                      <h3 className="text-xs font-labels font-semibold uppercase tracking-wider">Reference Visuals</h3>
                    </div>
                    {selected.referenceImages && selected.referenceImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {selected.referenceImages.map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg border border-white/10 overflow-hidden">
                            <img src={img} alt="Ref" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[100px] rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-ink-muted">
                        No reference images
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
}
