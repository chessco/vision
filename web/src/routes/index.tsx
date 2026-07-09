import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TenantGuard } from './TenantGuard';

// ─── Page Imports ────────────────────────────────────────────────
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CreativeChatPage } from '../features/chat/pages/CreativeChatPage';
import { CreativeChatLegacyPage } from '../features/chat/pages/CreativeChatLegacyPage';
import { BrandStudioPage } from '../features/brand/pages/BrandStudioPage';
import { AudienceStudioPage } from '../features/audience/pages/AudienceStudioPage';
import { CampaignStudioPage } from '../features/campaigns/pages/CampaignStudioPage';
import { ContentStudioPage } from '../features/content/pages/ContentStudioPage';
import { PublisherStudioPage } from '../features/publisher/pages/PublisherStudioPage';
import { AnalyticsStudioPage } from '../features/analytics/pages/AnalyticsStudioPage';
import { OptimizationStudioPage } from '../features/optimization/pages/OptimizationStudioPage';
import { TrendStudioPage } from '../features/trends/pages/TrendStudioPage';
import { CharactersPage } from '../features/characters/pages/CharactersPage';
import { LibraryPage } from '../features/library/pages/LibraryPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { LoginPage } from '../features/auth/pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/t/:tenantId/visual',
    element: <TenantGuard />,
    children: [
      // Core
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chat', element: <CreativeChatPage /> },
      { path: 'legacy-chat', element: <CreativeChatLegacyPage /> },

      // Social Suite
      { path: 'brand', element: <BrandStudioPage /> },
      { path: 'audience', element: <AudienceStudioPage /> },
      { path: 'campaigns', element: <CampaignStudioPage /> },
      { path: 'content', element: <ContentStudioPage /> },
      { path: 'publisher', element: <PublisherStudioPage /> },
      { path: 'analytics', element: <AnalyticsStudioPage /> },
      { path: 'optimization', element: <OptimizationStudioPage /> },
      { path: 'trends', element: <TrendStudioPage /> },

      // Creative
      { path: 'characters', element: <CharactersPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'brand-assets', element: <LibraryPage /> },

      // Settings
      { path: 'settings', element: <SettingsPage /> },

      // Default redirect
      { index: true, element: <Navigate to="dashboard" replace /> },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/t/default/visual/dashboard" replace />
  }
]);
