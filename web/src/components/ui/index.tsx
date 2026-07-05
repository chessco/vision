// ─── Shared UI Components ────────────────────────────────────────
// Reusable UI primitives for the Vision design system.

import { type ReactNode } from 'react';
import clsx from 'clsx';
import {
  TrendingUp, TrendingDown, Minus, Sparkles,
  type LucideIcon,
} from 'lucide-react';

// ─── Glass Panel ────────────────────────────────────────────────
interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'purple' | 'cyan' | 'amber' | false;
}

export function GlassPanel({ children, className, hover = false, glow = false }: GlassPanelProps) {
  return (
    <div className={clsx(
      'bg-paper/80 backdrop-blur-md border border-border-subtle rounded-xl',
      hover && 'card-hover-effect',
      glow === 'purple' && 'shadow-[0_0_20px_rgba(139,92,246,0.1)]',
      glow === 'cyan' && 'shadow-[0_0_20px_rgba(6,182,212,0.1)]',
      glow === 'amber' && 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      className,
    )}>
      {children}
    </div>
  );
}

// ─── Metric Card ────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: LucideIcon;
  sparkline?: number[];
  suffix?: string;
  className?: string;
}

export function MetricCard({ label, value, change, trend, icon: Icon, sparkline, suffix = '', className }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-ink-muted';

  return (
    <GlassPanel className={clsx('p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-labels text-ink-muted uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-headings font-semibold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={clsx('flex items-center gap-1 mt-1', trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <MiniSparkline data={sparkline} trend={trend} />
        )}
      </div>
    </GlassPanel>
  );
}

// ─── Mini Sparkline ─────────────────────────────────────────────
function MiniSparkline({ data, trend }: { data: number[]; trend?: 'up' | 'down' | 'stable' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 64;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
  const color = trend === 'up' ? '#34d399' : trend === 'down' ? '#f87171' : '#9ca3af';

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

// ─── Status Badge ───────────────────────────────────────────────
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_COLORS: Record<string, string> = {
  // Post statuses
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  publishing: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  // Campaign statuses
  planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  // Character statuses
  DRAFT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  TRAINING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ARCHIVED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  // Social account
  connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  disconnected: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  expired: 'bg-red-500/10 text-red-400 border-red-500/20',
  // Content
  generated: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  humanized: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full border font-medium uppercase tracking-wider',
      colors,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Empty State ────────────────────────────────────────────────
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
        <Icon className="w-8 h-8 text-ink-muted" />
      </div>
      <h3 className="text-lg font-headings font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Page Header ────────────────────────────────────────────────
interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-headings font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {title}
        </h1>
        <p className="text-sm text-ink-muted ml-[52px]">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

// ─── Section Header ─────────────────────────────────────────────
interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ icon: Icon, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-labels font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {title}
      </h2>
      {action}
    </div>
  );
}

// ─── Loading Spinner ────────────────────────────────────────────
interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ label = 'Loading...', fullPage = false }: LoadingSpinnerProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center gap-3',
      fullPage ? 'h-full min-h-[400px]' : 'py-12',
    )}>
      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      <span className="text-sm text-ink-muted font-medium">{label}</span>
    </div>
  );
}

// ─── Tab Bar ────────────────────────────────────────────────────
interface TabBarProps {
  tabs: { id: string; label: string; icon?: LucideIcon; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border-subtle">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-ink-muted hover:text-white hover:bg-white/5',
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={clsx(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-primary/20 text-primary' : 'bg-white/10 text-ink-muted',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Platform Icon ──────────────────────────────────────────────
const PLATFORM_ICONS: Record<string, { emoji: string; color: string; bg: string }> = {
  facebook: { emoji: '📘', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  instagram: { emoji: '📸', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  linkedin: { emoji: '💼', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  x: { emoji: '𝕏', color: 'text-white', bg: 'bg-white/10' },
  tiktok: { emoji: '🎵', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  whatsapp: { emoji: '💬', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export function PlatformBadge({ platform, showLabel = true }: { platform: string; showLabel?: boolean }) {
  const config = PLATFORM_ICONS[platform] || { emoji: '🌐', color: 'text-ink-muted', bg: 'bg-white/5' };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium', config.bg, config.color)}>
      <span>{config.emoji}</span>
      {showLabel && <span className="capitalize">{platform}</span>}
    </span>
  );
}

// ─── Score Bar ──────────────────────────────────────────────────
export function ScoreBar({ label, value, max = 100, color = 'primary' }: { label: string; value: number; max?: number; color?: string }) {
  const percent = Math.min(100, (value / max) * 100);
  const barColor = color === 'primary' ? 'bg-primary' : color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : color === 'cyan' ? 'bg-cyan-500' : 'bg-primary';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
