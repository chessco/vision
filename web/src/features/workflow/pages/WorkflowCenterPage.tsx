import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toApiTenantId } from '../../../utils/tenant';
import { useTranslation } from 'react-i18next';

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  mediaUrls: string[];
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface Asset {
  id: string;
  name: string;
  url: string;
}

export function WorkflowCenterPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [platform, setPlatform] = useState<string>('FACEBOOK');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const fetchPosts = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get<SocialPost[]>(`/api/tenants/${apiTenantId}/social-posts`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching social posts', err);
    }
  };

  const fetchAssets = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get<Asset[]>(`/api/tenants/${apiTenantId}/assets`);
      setAssets(res.data);
    } catch (err) {
      console.error('Error fetching assets', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchAssets();
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !selectedAsset || !content) return;

    try {
      const assetObj = assets.find(a => a.id === selectedAsset);
      await axios.post(`/api/tenants/${apiTenantId}/social-posts`, {
        platform,
        content,
        mediaUrls: assetObj ? [assetObj.url] : [],
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      setIsFormOpen(false);
      setContent('');
      setScheduledAt('');
      setSelectedAsset('');
      fetchPosts();
    } catch (err) {
      console.error('Error scheduling post', err);
      alert(t('Error al agendar la publicación'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    try {
      await axios.delete(`/api/tenants/${apiTenantId}/social-posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-light tracking-wide text-ink-text mb-2">
            {t('Workflow Center')}
          </h1>
          <p className="text-ink-subtle">
            {t('Agenda tus assets visuales para publicación automática')}
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-secondary text-background font-medium py-2 px-6 rounded-full transition-colors"
        >
          + {t('Nueva Publicación')}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-paper-surface border border-border-subtle p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-display mb-4 text-ink-text">{t('Programar Post')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-subtle mb-1">{t('Red Social')}</label>
              <select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md p-2 text-ink-text"
              >
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink-subtle mb-1">{t('Asset Visual')}</label>
              <select 
                value={selectedAsset} 
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md p-2 text-ink-text"
                required
              >
                <option value="" disabled>{t('Selecciona un asset generado...')}</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-subtle mb-1">{t('Copy / Contenido')}</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md p-2 text-ink-text min-h-[100px]"
                placeholder={t('Escribe el texto de tu publicación...')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-subtle mb-1">{t('Fecha y Hora (Opcional - dejar vacío para DRAFT)')}</label>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md p-2 text-ink-text"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button type="submit" className="bg-primary hover:bg-secondary text-background font-medium py-2 px-6 rounded-md transition-colors flex-1">
                {t('Agendar / Guardar')}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="bg-transparent border border-border-subtle text-ink-subtle hover:text-ink-text py-2 px-6 rounded-md flex-1">
                {t('Cancelar')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-paper-surface border border-border-subtle rounded-xl p-6 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-ink-subtle">
            <span className="text-4xl mb-4">📅</span>
            <p>{t('No tienes publicaciones programadas.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div key={post.id} className="bg-background border border-border-subtle p-4 rounded-xl flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-mono font-medium
                    ${post.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 
                      post.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-yellow-500/20 text-yellow-400'}
                  `}>
                    {post.status}
                  </span>
                  <button onClick={() => handleDelete(post.id)} className="text-ink-subtle hover:text-red-400 transition-colors">
                    ×
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{post.platform === 'FACEBOOK' ? '📘' : '📸'}</span>
                  <span className="font-medium text-ink-text">{post.platform}</span>
                </div>

                <p className="text-sm text-ink-subtle mb-4 line-clamp-3 flex-1">{post.content}</p>
                
                {post.mediaUrls.length > 0 && (
                  <div className="h-32 mb-4 rounded-md overflow-hidden bg-surface-container">
                    <img src={post.mediaUrls[0]} alt="media" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                )}

                <div className="text-xs text-ink-subtle pt-3 border-t border-border-subtle mt-auto">
                  {post.scheduledAt ? `📅 ${new Date(post.scheduledAt).toLocaleString()}` : t('No agendado')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
