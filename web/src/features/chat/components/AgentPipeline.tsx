// ─── Agent Pipeline ─────────────────────────────────────────────
// Visualizes the progression of the AI agent workflow.

import { CheckCircle2, Loader2, Sparkles, Send, Brain, Eye, Search } from 'lucide-react';
import clsx from 'clsx';
import type { AgentStep, AgentPipelineStage } from '../../../types';

interface AgentPipelineProps {
  steps: AgentStep[];
}

export function AgentPipeline({ steps }: AgentPipelineProps) {
  const STAGES: { stage: AgentPipelineStage; label: string; icon: any }[] = [
    { stage: 'creative_director', label: 'Strategy', icon: Brain },
    { stage: 'copywriter', label: 'Copywriting', icon: Search },
    { stage: 'designer', label: 'Design', icon: Sparkles },
    { stage: 'compliance', label: 'Compliance', icon: Eye },
    { stage: 'publisher', label: 'Publish', icon: Send },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {STAGES.map((stage, i) => {
        const step = steps.find(s => s.agent === stage.stage);
        const status = step?.status || 'pending';
        
        return (
          <div key={stage.stage} className="flex items-center gap-2 shrink-0">
            <div className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
              status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              status === 'running' ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(139,92,246,0.2)]' :
              status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-white/5 border-white/5 text-ink-muted',
            )}>
              {status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
               status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               <stage.icon className="w-3.5 h-3.5" />}
              {stage.label}
            </div>
            {i < STAGES.length - 1 && (
              <div className={clsx(
                'w-4 h-px',
                step && status === 'done' ? 'bg-emerald-500/30' : 'bg-border-subtle'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
