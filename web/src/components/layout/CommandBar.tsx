// ─── Command Bar ─────────────────────────────────────────────────
// Top bar with global search, notifications, and user info.

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Command, X } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  chat: 'Creative Chat',
  brand: 'Brand Studio',
  audience: 'Audience Studio',
  campaigns: 'Campaign Studio',
  content: 'Content Studio',
  publisher: 'Publisher Studio',
  analytics: 'Analytics Studio',
  optimization: 'Optimization Studio',
  trends: 'Trend Studio',
  characters: 'Character Studio',
  library: 'Asset Studio',
  'brand-assets': 'Brand Assets',
  settings: 'Settings',
};

export function CommandBar() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Get current page label from route
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] || 'dashboard';
  const pageLabel = ROUTE_LABELS[currentPage] || currentPage;

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="h-14 border-b border-border-subtle bg-[#0d0b14]/60 backdrop-blur-xl flex items-center justify-between px-5 shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted font-labels">Vision</span>
        <span className="text-ink-muted/30">/</span>
        <span className="text-sm text-white font-medium">{pageLabel}</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-8">
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, content, assets..."
              className="w-full bg-background border border-primary/30 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder:text-ink-muted/50 focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-ink-muted hover:text-white transition-colors" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-border-subtle rounded-lg text-xs text-ink-muted transition-all w-full max-w-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono border border-white/10">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-border-subtle">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
            FC
          </div>
          <div className="hidden lg:block">
            <p className="text-xs text-white font-medium leading-tight">Francisco</p>
            <p className="text-[10px] text-ink-muted leading-tight">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
