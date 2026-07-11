// ─── Context Panel ───────────────────────────────────────────────
// Right panel showing contextual information based on current route.

import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios';
import { toApiTenantId } from '../../lib/api';
import {
  PanelRightClose, PanelRightOpen, Brain, Sparkles,
  Target, Image, TrendingUp, Clock, Users, Palette,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ContextItem {
  icon: typeof Brain;
  label: string;
  value: string;
  color?: string;
}

export function ContextPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = tenantId ? toApiTenantId(tenantId) : 'DEFAULT_TENANT';
  
  const [assets, setAssets] = useState<any[]>([]);
  const [activeBrand, setActiveBrand] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      const mockAssets = [
        { id: '1', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80', title: 'Asset 1' },
        { id: '2', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80', title: 'Asset 2' },
        { id: '3', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80', title: 'Asset 3' },
        { id: '4', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', title: 'Asset 4' },
      ];
      const mockBrands = [
        { id: 'b1', name: 'AAA Abogados' },
        { id: 'b2', name: 'TechNova Solutions' }
      ];


      axios.get(`/api/tenants/${apiTenantId}/brands`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setBrands(res.data);
            if (!activeBrand) setActiveBrand(res.data[0]);
          } else {
            // Fallback to mock if API has no brands
            setBrands(mockBrands);
            if (!activeBrand) setActiveBrand(mockBrands[0]);
          }
        })
        .catch(err => {
          console.error('Failed to load brands', err);
          setBrands(mockBrands);
          if (!activeBrand) setActiveBrand(mockBrands[0]);
        });

      axios.get(`/api/tenants/${apiTenantId}/assets`)
        .then(res => {
          if (res.data && res.data.length > 0) setAssets(res.data);
          else setAssets(mockAssets);
        })
        .catch(err => {
          console.error('Failed to load assets', err);
          setAssets(mockAssets);
        });
        
      axios.get(`/api/tenants/${apiTenantId}/campaigns`)
        .then(res => {
          setCampaigns(res.data || []);
        })
        .catch(err => {
          console.error('Failed to load campaigns', err);
          setCampaigns([]);
        });
    }
  }, [apiTenantId, open]); // Only depend on open and apiTenantId to fetch initially

  // Filter campaigns whenever campaigns or activeBrand changes
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  
  useEffect(() => {
    if (activeBrand) {
      localStorage.setItem('pitaya_vision_active_brand', activeBrand.id);
    } else {
      localStorage.removeItem('pitaya_vision_active_brand');
    }
    if (activeBrand && campaigns.length > 0) {
      const filtered = campaigns.filter(c => !c.brandId || c.brandId === activeBrand.id);
      setFilteredCampaigns(filtered);
      
      if (!activeCampaign || (activeCampaign.brandId && activeCampaign.brandId !== activeBrand.id)) {
        setActiveCampaign(filtered.length > 0 ? filtered[0] : null);
      }
    } else {
      setFilteredCampaigns([]);
      setActiveCampaign(null);
    }
  }, [activeBrand, campaigns]);

  useEffect(() => {
    if (activeCampaign) {
      localStorage.setItem('pitaya_vision_active_campaign', activeCampaign.id);
      window.dispatchEvent(new CustomEvent('active-campaign-changed', { detail: activeCampaign.id }));
    } else {
      localStorage.removeItem('pitaya_vision_active_campaign');
      window.dispatchEvent(new CustomEvent('active-campaign-changed', { detail: null }));
    }
  }, [activeCampaign]);

  useEffect(() => {
    const handleCampaignCreated = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newCampaign = customEvent.detail;
      
      // Refetch full campaign list to ensure consistency and assets are loaded
      axios.get(`/api/tenants/${apiTenantId}/campaigns`)
        .then(res => {
          setCampaigns(res.data || []);
          setActiveCampaign(newCampaign);
        })
        .catch(err => console.error('Failed to reload campaigns', err));

      // Refetch assets so the recent assets panel updates
      axios.get(`/api/tenants/${apiTenantId}/assets`)
        .then(res => {
          if (res.data && res.data.length > 0) setAssets(res.data);
        })
        .catch(err => console.error('Failed to reload assets', err));
    };

    const handleBrandsUpdated = () => {
      axios.get(`/api/tenants/${apiTenantId}/brands`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setBrands(res.data);
            const savedBrandId = localStorage.getItem('pitaya_vision_active_brand');
            const found = res.data.find((b: any) => b.id === savedBrandId);
            if (found) setActiveBrand(found);
            else setActiveBrand(res.data[0]);
          }
        })
        .catch(err => console.error('Failed to reload brands', err));
    };

    const handleAssetsUpdated = () => {
      axios.get(`/api/tenants/${apiTenantId}/assets`)
        .then(res => {
          if (res.data && res.data.length > 0) setAssets(res.data);
        })
        .catch(err => console.error('Failed to reload assets', err));
    };

    window.addEventListener('campaign-created', handleCampaignCreated);
    window.addEventListener('brands-updated', handleBrandsUpdated);
    window.addEventListener('assets-updated', handleAssetsUpdated);
    return () => {
      window.removeEventListener('campaign-created', handleCampaignCreated);
      window.removeEventListener('brands-updated', handleBrandsUpdated);
      window.removeEventListener('assets-updated', handleAssetsUpdated);
    };
  }, [apiTenantId]);

  const handleSuggestionClick = (suggestion: string) => {
    if (location.pathname.endsWith('/chat')) {
      window.dispatchEvent(new CustomEvent('send-chat-message', { detail: suggestion }));
    } else {
      navigate(`/${tenantId || 'default'}/chat`, { state: { initialPrompt: suggestion } });
    }
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] || 'dashboard';

  // Context items based on current page
  const getContextItems = (): ContextItem[] => {
    const base: ContextItem[] = [
      { icon: Brain, label: t('Active Agent'), value: t('Creative Director'), color: 'text-primary' },
      { icon: Palette, label: t('Active Brand'), value: activeBrand ? activeBrand.name : t('None'), color: 'text-pink-400' },
      { icon: Target, label: t('Active Campaign'), value: activeCampaign ? activeCampaign.name : t('None'), color: 'text-secondary' },
    ];

    if (currentPage === 'chat') {
      return [
        ...base,
        { icon: Users, label: t('Brand Memory'), value: `12 ${t('entries')}` },
        { icon: Users, label: t('Audience Memory'), value: `8 ${t('insights')}` },
      ];
    }
    if (currentPage === 'publisher' || currentPage === 'content') {
      return [
        ...base,
        { icon: Clock, label: t('Scheduled'), value: `5 ${t('posts')}` },
        { icon: TrendingUp, label: t('Best Time'), value: '9-11 AM' },
      ];
    }
    return base;
  };

  const suggestions = [
    t('Create a storytelling post about company values'),
    t('Schedule a behind-the-scenes reel for Thursday'),
    t('A/B test your CTA with the word "discover"'),
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 p-2 bg-paper border border-border-subtle border-r-0 rounded-l-lg text-ink-muted hover:text-primary transition-colors z-30"
        title="Open context panel"
      >
        <PanelRightOpen className="w-4 h-4" />
      </button>
    );
  }

  const filteredAssets = activeCampaign
    ? assets.filter(a => a.campaignId === activeCampaign.id)
    : assets;

  return (
    <aside className={clsx(
      'w-[280px] h-full border-l border-border-subtle bg-[#0d0b14]/90 backdrop-blur-xl flex flex-col shrink-0',
      'animate-in slide-in-from-right duration-200',
    )}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
        <span className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">{t('Context')}</span>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-md hover:bg-white/5 text-ink-muted hover:text-white transition-colors"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Context Items */}
        <div className="space-y-2">
          {getContextItems().map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
              <item.icon className={clsx('w-4 h-4 shrink-0', item.color || 'text-ink-muted')} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider">{item.label}</p>
                {item.label === t('Active Brand') ? (
                  <select
                    className="text-xs text-white font-medium bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer outline-none truncate"
                    value={activeBrand?.id || ''}
                    onChange={(e) => setActiveBrand(brands.find(b => b.id === e.target.value))}
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id} className="bg-[#0d0b14]">{b.name}</option>
                    ))}
                  </select>
                ) : item.label === t('Active Campaign') ? (
                  <select
                    className="text-xs text-white font-medium bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer outline-none truncate"
                    value={activeCampaign?.id || ''}
                    onChange={(e) => setActiveCampaign(filteredCampaigns.find(c => c.id === e.target.value))}
                  >
                    {filteredCampaigns.length === 0 && (
                      <option value="" className="bg-[#0d0b14]">{t('No campaigns')}</option>
                    )}
                    {filteredCampaigns.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0d0b14]">{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-white font-medium truncate">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-labels font-semibold text-ink-muted uppercase tracking-wider">{t('AI Suggestions')}</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2.5 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 text-xs text-ink-muted hover:text-white transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Assets */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[10px] font-labels font-semibold text-ink-muted uppercase tracking-wider">{t('Recent Assets')}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {filteredAssets.length > 0 ? (
              filteredAssets.slice(0, 6).map((asset) => (
                <div key={asset.id} className="aspect-square rounded-md bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" title={asset.title} />
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-md bg-white/5 border border-white/5 flex items-center justify-center">
                  <Image className="w-4 h-4 text-ink-muted/30" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-labels font-semibold text-ink-muted uppercase tracking-wider">{t('Performance')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">{t('Engagement Rate')}</span>
              <span className="text-emerald-400 font-medium">8.4%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">{t('Avg. Reach')}</span>
              <span className="text-white font-medium">12.4K</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-ink-muted">{t('Best Channel')}</span>
              <span className="text-blue-400 font-medium">Facebook</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
