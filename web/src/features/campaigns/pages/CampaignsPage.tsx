import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Layers, Loader2, Calendar, Target, Trash2 } from 'lucide-react';
import { toApiTenantId } from '../../../utils/tenant';
import { useTranslation } from 'react-i18next';

interface AssetPreview {
  id: string;
  url: string;
  type: string;
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  audience: string;
  createdAt: string;
  assets: AssetPreview[];
}

export function CampaignsPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`/api/tenants/${apiTenantId}/campaigns`);
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [tenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('¿Estás seguro de eliminar esta campaña y todos sus activos?'))) return;
    try {
      await axios.delete(`/api/tenants/${apiTenantId}/campaigns/${id}`);
      await fetchCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="space-y-2">
        <h1 className="text-3xl font-headings font-bold text-white flex items-center gap-2">
          <Layers className="w-8 h-8 text-primary" />
          {t('Campañas')}
        </h1>
        <p className="text-ink-muted">{t('Agrupación de activos generados bajo un mismo objetivo de marketing.')}</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center space-y-4">
          <Layers className="w-12 h-12 text-ink-muted" />
          <h3 className="text-lg font-semibold text-white">{t('No tienes campañas aún')}</h3>
          <p className="text-sm text-ink-muted max-w-sm">{t('Ve al Chat Creativo y aprueba un diseño para crear tu primera campaña.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="glass-panel p-6 rounded-lg border border-border-subtle flex flex-col gap-4 group relative">
              <button 
                onClick={() => handleDelete(campaign.id)}
                className="absolute top-4 right-4 text-ink-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title={t('Eliminar campaña')}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <h3 className="text-xl font-semibold text-white">{campaign.name}</h3>
                <div className="flex items-center gap-4 text-xs text-ink-muted mt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(campaign.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {campaign.audience}</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-background border border-border-subtle">
                <span className="text-[10px] text-ink-muted uppercase font-labels tracking-wider">{t('Objetivo / Copy Base')}</span>
                <p className="text-sm text-white mt-1 line-clamp-2">{campaign.objective}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-ink-muted uppercase font-labels tracking-wider">{t('Activos')} ({campaign.assets?.length || 0})</span>
                {campaign.assets && campaign.assets.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {campaign.assets.map(asset => (
                      <div key={asset.id} className="w-24 h-24 rounded border border-border-subtle overflow-hidden shrink-0">
                        <img src={asset.url && !asset.url.includes('localhost') ? asset.url : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%231a1a2e"><rect width="96" height="96"/></svg>'} alt="Asset preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="%231a1a2e"><rect width="96" height="96"/></svg>'; }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted italic">{t('Sin activos en esta campaña.')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
