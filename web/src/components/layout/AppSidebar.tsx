// ─── App Sidebar ─────────────────────────────────────────────────
// Grouped navigation sidebar for the Vision Creative Operating System.
// Sections: Core, Social Suite, Creative, Settings

import { Link, useLocation, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, MessageSquare, Palette, Users, Megaphone,
  FileText, Send, BarChart3, Lightbulb, TrendingUp,
  UserCircle, Image, Package, Settings, Sparkles,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppSidebar() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const basePath = `/t/${tenantId}/visual`;

  const sections: NavSection[] = [
    {
      title: '',
      items: [
        { icon: LayoutDashboard, label: t('Dashboard'), path: `${basePath}/dashboard` },
        { icon: MessageSquare, label: t('Creative Chat'), path: `${basePath}/chat` },
        { icon: MessageSquare, label: t('Legacy Chat'), path: `${basePath}/legacy-chat` },
      ],
    },
    {
      title: t('SOCIAL'),
      items: [
        { icon: Palette, label: t('Brand Studio'), path: `${basePath}/brand` },
        { icon: Users, label: t('Audience Studio'), path: `${basePath}/audience` },
        { icon: Megaphone, label: t('Campaign Studio'), path: `${basePath}/campaigns` },
        { icon: FileText, label: t('Content Studio'), path: `${basePath}/content` },
        { icon: Send, label: t('Publisher Studio'), path: `${basePath}/publisher` },
        { icon: BarChart3, label: t('Analytics Studio'), path: `${basePath}/analytics` },
        { icon: Lightbulb, label: t('Optimization Studio'), path: `${basePath}/optimization` },
        { icon: TrendingUp, label: t('Trend Studio'), path: `${basePath}/trends` },
      ],
    },
    {
      title: t('CREATIVE'),
      items: [
        { icon: UserCircle, label: t('Character Studio'), path: `${basePath}/characters` },
        { icon: Image, label: t('Asset Studio'), path: `${basePath}/library` },
        { icon: Package, label: t('Brand Assets'), path: `${basePath}/brand-assets` },
      ],
    },
  ];

  const isActive = (path: string) => {
    // Exact match for dashboard, prefix match for others
    if (path.endsWith('/dashboard')) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={clsx(
        'h-screen flex flex-col border-r border-border-subtle transition-all duration-300 shrink-0',
        'bg-[#0d0b14]/90 backdrop-blur-xl',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )}
    >
      {/* Brand */}
      <div className={clsx(
        'flex items-center h-14 border-b border-border-subtle px-4 gap-3',
        collapsed && 'justify-center',
      )}>
        <div className="relative">
          <Sparkles className="w-6 h-6 text-primary" />
          <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm" />
        </div>
        {!collapsed && (
          <span className="font-headings font-bold text-white text-sm tracking-tight">
            Pitaya Vision
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className={clsx(
                'px-3 pt-4 pb-2',
                collapsed && 'px-1 text-center',
              )}>
                {collapsed ? (
                  <div className="w-8 h-px bg-border-subtle mx-auto" />
                ) : (
                  <span className="text-[10px] font-labels font-semibold text-ink-muted/50 uppercase tracking-[0.12em]">
                    {section.title}
                  </span>
                )}
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-ink-muted hover:text-white hover:bg-white/5',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={clsx('w-[18px] h-[18px] shrink-0', active && 'drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]')} />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Settings + Collapse */}
      <div className="border-t border-border-subtle p-2 space-y-1">
        <Link
          to={`${basePath}/settings`}
          title={t('Settings')}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-white hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-2',
            isActive(`${basePath}/settings`) && 'bg-primary/10 text-primary',
          )}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>{t('Settings')}</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-white hover:bg-white/5 transition-all w-full',
            collapsed && 'justify-center px-2',
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">{t('Collapse')}</span>}
        </button>
      </div>
    </aside>
  );
}
