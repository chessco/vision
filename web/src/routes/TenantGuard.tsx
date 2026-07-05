// ─── Tenant Guard ────────────────────────────────────────────────
// Root layout with 4-panel architecture:
// Left: AppSidebar | Top: CommandBar | Center: Outlet | Right: ContextPanel
// Bottom: NotificationBar (floating)

import { useParams, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AppSidebar } from '../components/layout/AppSidebar';
import { CommandBar } from '../components/layout/CommandBar';
import { ContextPanel } from '../components/layout/ContextPanel';
import { NotificationBar } from '../components/layout/NotificationBar';
import { useNotifications } from '../hooks/useNotifications';
import { Sparkles } from 'lucide-react';

// Axios uses relative paths — Vite proxy forwards /api and /agents to the NestJS API on port 3016
axios.defaults.headers.common['x-user-role'] = 'ADMIN';
axios.defaults.headers.common['x-api-key'] = import.meta.env.VITE_PITAYACORE_API_KEY || '';

function getActiveUrl(): string {
  const saved = localStorage.getItem('pitaya_vision_active_connection');
  return saved || import.meta.env.VITE_PITAYACORE_URL || 'https://pitayacore-api.pitayacode.io';
}

// Don't set a global baseURL - let each request use the correct URL
// Vision chat endpoints use relative paths (Vite proxy)
// PitayaCore endpoints use the full URL

export function TenantGuard() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [loading, setLoading] = useState(true);
  const { notifications, dismissNotification } = useNotifications();

  useEffect(() => {
    if (tenantId) {
      const actualTenantId = tenantId === 'default' ? 'DEFAULT_TENANT' : tenantId;
      console.log(`Setting tenant context in request headers: ${actualTenantId}`);
      axios.defaults.headers.common['x-tenant-id'] = actualTenantId;
    }
    
    // Set baseURL for PitayaCore calls only
    // Vision chat calls use relative paths (Vite proxy)
    const pitayaBaseUrl = getActiveUrl();
    
    // Override axios interceptors to route correctly
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const url = config.url || '';
      // If it's a Vision API call (starts with /api/), use relative path (Vite proxy)
      if (url.startsWith('/api/')) {
        config.baseURL = '';
      } else if (!config.baseURL || config.baseURL === '') {
        // For PitayaCore calls, use the configured URL
        config.baseURL = pitayaBaseUrl;
      }
      return config;
    });

    setLoading(false);

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg animate-pulse" />
          </div>
          <div className="text-ink-muted font-labels text-sm tracking-wider">
            Loading Creative Suite...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-ink-text font-sans overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Command Bar */}
        <CommandBar />

        {/* Workspace + Context Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Workspace */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>

          {/* Right Context Panel */}
          <ContextPanel />
        </div>
      </div>

      {/* Bottom Notification Bar (Floating) */}
      <NotificationBar
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
