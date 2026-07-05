import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Save, Loader2, Sparkles } from 'lucide-react';
import { toApiTenantId } from '../../../utils/tenant';

export function BrandPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    primaryColor: '#8b5cf6',
    styleGuidelines: '',
    toneOfVoice: '',
  });

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await axios.get(`/api/tenants/${apiTenantId}/brand`);
        if (res.data) {
          setFormData({
            primaryColor: res.data.primaryColor || '#8b5cf6',
            styleGuidelines: res.data.styleGuidelines || '',
            toneOfVoice: res.data.toneOfVoice || '',
          });
        }
      } catch (err) {
        console.error('Error fetching brand:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`/api/tenants/${apiTenantId}/brand`, formData);
    } catch (err) {
      console.error('Error saving brand:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="space-y-2">
        <h1 className="text-3xl font-headings font-bold text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Brand Brain
        </h1>
        <p className="text-ink-muted">Define la identidad visual y tono de voz que la IA usará como contexto para todas las generaciones.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-headings font-semibold text-white">Identidad Visual</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">Color Primario</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <input 
                  type="text" 
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  className="bg-background border border-border-subtle rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">Guías de Estilo (Prompts base para la IA)</label>
              <textarea 
                value={formData.styleGuidelines}
                onChange={(e) => setFormData({...formData, styleGuidelines: e.target.value})}
                placeholder="Ej. Estilo fotográfico realista, evitar ilustraciones, iluminación cálida, cinemático..."
                className="w-full h-32 bg-background border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-headings font-semibold text-white">Tono de Comunicación</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-muted">Voz de la Marca (Para el Copywriter IA)</label>
              <textarea 
                value={formData.toneOfVoice}
                onChange={(e) => setFormData({...formData, toneOfVoice: e.target.value})}
                placeholder="Ej. Técnico pero educativo, empático, usar emojis modernos..."
                className="w-full h-24 bg-background border border-border-subtle rounded p-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-md flex items-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
