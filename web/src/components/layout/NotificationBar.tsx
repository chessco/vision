// ─── Notification Bar ────────────────────────────────────────────
// Bottom bar for system notifications, publishing status, generation progress.

import { X, CheckCircle, AlertCircle, Info, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';
import type { AppNotification } from '../../types';

interface NotificationBarProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const ICON_MAP = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
  publishing: Send,
  generation: Loader2,
};

const COLOR_MAP = {
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  publishing: 'text-primary bg-primary/10 border-primary/20',
  generation: 'text-secondary bg-secondary/10 border-secondary/20',
};

export function NotificationBar({ notifications, onDismiss }: NotificationBarProps) {
  if (notifications.length === 0) return null;

  // Show only the latest 3 notifications
  const visible = notifications.slice(0, 3);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {visible.map((n) => {
        const Icon = ICON_MAP[n.type] || Info;
        const colors = COLOR_MAP[n.type] || COLOR_MAP.info;
        const isAnimated = n.type === 'generation' || n.type === 'publishing';

        return (
          <div
            key={n.id}
            className={clsx(
              'flex items-start gap-3 p-3 rounded-xl border backdrop-blur-xl',
              'animate-in slide-in-from-right-5 duration-300',
              colors,
            )}
          >
            <Icon className={clsx('w-4 h-4 shrink-0 mt-0.5', isAnimated && 'animate-spin')} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white">{n.title}</p>
              <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2">{n.message}</p>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="p-0.5 rounded hover:bg-white/10 text-ink-muted hover:text-white transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
