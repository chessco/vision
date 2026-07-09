// ─── Audience Studio Page ────────────────────────────────────────
// Audience personas, emotion maps, pain maps, behavior maps.

import { useState } from 'react';
import { Users, Heart, AlertTriangle, Activity, Map, Plus, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, } from '../../../components/ui';
import { MOCK_AUDIENCE_PERSONAS } from '../../../lib/api';
import type { AudiencePersona } from '../../../types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

type AudienceTab = 'personas' | 'emotions' | 'pain-points' | 'behaviors' | 'journey';

export function AudienceStudioPage() {
  const [activeTab, setActiveTab] = useState<AudienceTab>('personas');
  const [isCreating, setIsCreating] = useState(false);
  const [personas, setPersonas] = useState<AudiencePersona[]>(MOCK_AUDIENCE_PERSONAS);
  const { t } = useTranslation();

  const tabs = [
    { id: 'personas', label: t('Personas'), icon: Users },
    { id: 'emotions', label: t('Emotion Map'), icon: Heart },
    { id: 'pain-points', label: t('Pain Points'), icon: AlertTriangle },
    { id: 'behaviors', label: t('Behaviors'), icon: Activity },
    { id: 'journey', label: t('Customer Journey'), icon: Map },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Users}
        title={t('Audience Studio')}
        description={t('Understand your audience through AI-generated personas, emotion maps, and behavioral analysis.')}
        actions={
          <button 
            onClick={() => {
              setIsCreating(true);
              setTimeout(() => {
                const newPersona: AudiencePersona = {
                  id: Date.now().toString(),
                  name: `Nueva Persona ${personas.length + 1}`,
                  age: '25-34',
                  gender: 'Any',
                  location: 'Global',
                  occupation: 'Professional',
                  income: '$50k-$100k',
                  interests: ['Marketing', 'AI'],
                  painPoints: ['Lack of time'],
                  goals: ['Efficiency'],
                  behaviors: ['Online research'],
                  platforms: ['linkedin'],
                  emotions: [{ emotion: 'Curiosity', intensity: 80, trigger: 'New tech' }],
                  customerJourneyStage: 'awareness'
                };
                setPersonas(prev => [...prev, newPersona]);
                alert(t('Persona successfully created!'));
                setIsCreating(false);
              }, 1500);
            }}
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm disabled:opacity-50"
          >
            {isCreating ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isCreating ? t('Creating...') : t('Create Persona')}
          </button>
        }
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as AudienceTab)} />

      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          {personas.map((persona) => (
            <PersonaCard 
              key={persona.id} 
              persona={persona} 
              onEdit={() => {
                const newName = prompt(t('Enter new name for persona:'), persona.name);
                if (newName) {
                  setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p, name: newName } : p));
                }
              }}
              onDelete={() => {
                if (confirm(t('Are you sure you want to delete this persona?'))) {
                  setPersonas(prev => prev.filter(p => p.id !== persona.id));
                }
              }}
            />
          ))}
        </div>
      )}

      {activeTab === 'emotions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          {personas.map((persona) => (
            <GlassPanel key={persona.id} className="p-6 space-y-4" hover>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-headings font-semibold text-white">{persona.name}</h3>
                <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    const newName = prompt(t('Enter new name for persona:'), persona.name);
                    if (newName) setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p, name: newName } : p));
                  }}><Edit2 className="w-3.5 h-3.5 text-ink-muted hover:text-white" /></button>
                  <button onClick={() => {
                    if (confirm(t('Are you sure you want to delete this persona?'))) {
                      setPersonas(prev => prev.filter(p => p.id !== persona.id));
                    }
                  }}><Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" /></button>
                </div>
              </div>
              <div className="space-y-3">
                {persona.emotions.map((emotion, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-muted">{emotion.emotion}</span>
                      <span className="text-white font-medium">{emotion.intensity}%</span>
                    </div>
                    <div className="w-full h-2 bg-border-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${emotion.intensity}%`,
                          backgroundColor: emotion.intensity > 70 ? '#f87171' : emotion.intensity > 40 ? '#fbbf24' : '#34d399',
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-ink-muted">{t('Trigger')}: {emotion.trigger}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'pain-points' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          {personas.map((persona) => (
            <GlassPanel key={persona.id} className="p-6 space-y-4" hover>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-headings font-semibold text-white">{persona.name}</h3>
                <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    const newName = prompt(t('Enter new name for persona:'), persona.name);
                    if (newName) setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p, name: newName } : p));
                  }}><Edit2 className="w-3.5 h-3.5 text-ink-muted hover:text-white" /></button>
                  <button onClick={() => {
                    if (confirm(t('Are you sure you want to delete this persona?'))) {
                      setPersonas(prev => prev.filter(p => p.id !== persona.id));
                    }
                  }}><Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {persona.painPoints.map((pain, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-white">{pain}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-border-subtle">
                <h4 className="text-xs font-labels text-ink-muted uppercase tracking-wider mb-2">{t('Goals')}</h4>
                <div className="space-y-2">
                  {persona.goals.map((goal, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-emerald-400 mt-0.5">→</span>
                      <span className="text-sm text-white">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'behaviors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          {personas.map((persona) => (
            <GlassPanel key={persona.id} className="p-6 space-y-4" hover>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-headings font-semibold text-white">{persona.name}</h3>
                <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    const newName = prompt(t('Enter new name for persona:'), persona.name);
                    if (newName) setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p, name: newName } : p));
                  }}><Edit2 className="w-3.5 h-3.5 text-ink-muted hover:text-white" /></button>
                  <button onClick={() => {
                    if (confirm(t('Are you sure you want to delete this persona?'))) {
                      setPersonas(prev => prev.filter(p => p.id !== persona.id));
                    }
                  }}><Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-300" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {persona.behaviors.map((behavior, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                    <Activity className="w-4 h-4 text-secondary shrink-0" />
                    <span className="text-sm text-white">{behavior}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
                {persona.platforms.map((p) => (
                  <span key={p} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium capitalize">{p}</span>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {activeTab === 'journey' && (
        <GlassPanel className="p-8 animate-fade-in">
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
            {['Awareness', 'Consideration', 'Decision', 'Retention', 'Advocacy'].map((stage, i) => (
              <div key={stage} className="flex items-center gap-3 shrink-0">
                <div className={clsx(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border min-w-[140px]',
                  personas.some(p => p.customerJourneyStage === stage.toLowerCase())
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-white/3 border-white/5 text-ink-muted',
                )}>
                  <span className="text-2xl font-headings font-bold">{i + 1}</span>
                  <span className="text-xs font-medium">{t(stage)}</span>
                  <div className="flex -space-x-2 mt-1">
                    {personas
                      .filter(p => p.customerJourneyStage === stage.toLowerCase())
                      .map(p => (
                        <div key={p.id} className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[8px] font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                      ))}
                  </div>
                </div>
                {i < 4 && <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />}
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function PersonaCard({ persona, onEdit, onDelete }: { persona: AudiencePersona, onEdit?: () => void, onDelete?: () => void }) {
  return (
    <GlassPanel className="p-6 space-y-4 relative group" hover>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-ink-muted hover:text-white transition-colors" title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-white text-lg font-bold shrink-0">
          {persona.name.split(' ').pop()?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-headings font-semibold text-white">{persona.name}</h3>
          <p className="text-xs text-ink-muted">{persona.occupation} · {persona.location}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{persona.age}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{persona.gender}</span>
            {persona.income && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-ink-muted border border-white/10">{persona.income}</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {persona.interests.map((interest) => (
          <span key={interest} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-ink-muted border border-white/5">{interest}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
        {persona.platforms.map((p) => (
          <span key={p} className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-medium capitalize">{p}</span>
        ))}
        <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium capitalize">{persona.customerJourneyStage}</span>
      </div>
    </GlassPanel>
  );
}
