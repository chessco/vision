// ─── Asset Studio (Library) Page ──────────────────────────────────
// Central hub for all assets: images, videos, LoRAs, templates.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Image as ImageIcon, Video, Box, LayoutTemplate, Search, Filter, Upload, Download, Trash2, Maximize2, Sparkles } from 'lucide-react';
import { PageHeader, GlassPanel, TabBar, EmptyState, LoadingSpinner } from '../../../components/ui';
import { toApiTenantId } from '../../../lib/api';
import type { Asset } from '../../../types';

type ViewMode = 'all' | 'images' | 'videos' | 'loras' | 'templates';

export function LibraryPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get(`/api/tenants/${apiTenantId}/assets`);
        setAssets(res.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [apiTenantId]);

  const tabs = [
    { id: 'all', label: 'All Assets', icon: Box, count: assets.length },
    { id: 'images', label: 'Images', icon: ImageIcon, count: assets.filter(a => a.type === 'image' || a.type === 'generated').length },
    { id: 'videos', label: 'Videos', icon: Video, count: assets.filter(a => a.type === 'video').length },
    { id: 'loras', label: 'AI Models (LoRA)', icon: Sparkles, count: assets.filter(a => a.type === 'lora').length },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate, count: assets.filter(a => a.type === 'template').length },
  ];

  const filteredAssets = assets
    .filter(a => viewMode === 'all' || 
                 (viewMode === 'images' && (a.type === 'image' || a.type === 'generated')) ||
                 a.type === viewMode.replace(/s$/, ''))
    .filter(a => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                 a.tags?.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase())));

  if (loading) return <LoadingSpinner label="Loading Asset Studio..." fullPage />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in flex flex-col h-full">
      <PageHeader
        icon={ImageIcon}
        title="Asset Studio"
        description="Centralized library for your brand images, videos, generated art, and custom AI models."
        actions={
          <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm">
            <Upload className="w-4 h-4" />
            Upload Asset
          </button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <TabBar tabs={tabs} activeTab={viewMode} onChange={(id) => setViewMode(id as ViewMode)} />
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:border-primary focus:outline-none w-[200px]"
            />
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-border-subtle text-ink-muted hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <GlassPanel className="p-12 flex-1">
          <EmptyState
            icon={Box}
            title="No Assets Found"
            description={searchQuery ? "No assets match your search criteria." : "Your asset library is empty. Upload files or generate new art via Creative Chat."}
            action={!searchQuery ? { label: 'Upload Files', onClick: () => {} } : undefined}
          />
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children overflow-y-auto pb-8">
          {filteredAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const isImage = asset.type === 'image' || asset.type === 'generated' || asset.type === 'brand_asset';
  
  return (
    <div className="group rounded-xl border border-border-subtle bg-paper overflow-hidden hover:border-primary/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all">
      <div className="aspect-square bg-[#0d0b14] relative flex items-center justify-center">
        {isImage && asset.url ? (
          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            {asset.type === 'video' ? <Video className="w-6 h-6 text-ink-muted" /> :
             asset.type === 'lora' ? <Sparkles className="w-6 h-6 text-violet-400" /> :
             <LayoutTemplate className="w-6 h-6 text-ink-muted" />}
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors" title="View"><Maximize2 className="w-4 h-4" /></button>
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors" title="Download"><Download className="w-4 h-4" /></button>
          <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 backdrop-blur-sm transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-xs font-medium text-white truncate" title={asset.name}>{asset.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-ink-muted uppercase">{asset.type}</span>
          <span className="text-[10px] text-ink-muted">{formatBytes(asset.sizeBytes)}</span>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes?: number, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
