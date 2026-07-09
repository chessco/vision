import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CreateCenterPage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { t } = useTranslation();

  const handleCreate = () => {
    if (!prompt.trim()) return;
    navigate(`/t/${tenantId}/visual/chat`, { state: { initialPrompt: prompt } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-4xl font-display font-light text-primary mb-8 tracking-wide">
        {t('¿Qué quieres crear hoy?')}
      </h1>
      <div className="w-full max-w-2xl relative mb-12">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('Ej: Genera una campaña para Facebook...')}
          className="w-full bg-paper-surface border border-border-subtle rounded-full py-4 px-6 text-lg text-ink-text placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-lg transition-all duration-300"
        />
        <button 
          onClick={handleCreate}
          className="absolute right-2 top-2 bg-primary hover:bg-secondary text-background font-medium py-2 px-6 rounded-full transition-colors"
        >
          {t('Crear')}
        </button>
      </div>
      
      <div className="w-full max-w-3xl">
        <h2 className="text-sm uppercase tracking-widest text-ink-subtle mb-6">{t('Acciones Rápidas')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction title={t('Generar Imagen')} icon="🖼️" onClick={() => navigate(`/t/${tenantId}/visual/chat`, { state: { initialPrompt: t("Generar una imagen de...") } })} />
          <QuickAction title={t('Crear Campaña')} icon="📢" onClick={() => navigate(`/t/${tenantId}/visual/campaigns`)} />
          <QuickAction title={t('Crear Personaje')} icon="🎨" onClick={() => navigate(`/t/${tenantId}/visual/characters`)} />
          <QuickAction title={t('Nuevo Asset')} icon="✨" onClick={() => navigate(`/t/${tenantId}/visual/library`)} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, icon, onClick }: { title: string, icon: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-paper-surface border border-border-subtle rounded-xl hover:border-primary hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all group">
      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium text-ink-text">{title}</span>
    </button>
  );
}
