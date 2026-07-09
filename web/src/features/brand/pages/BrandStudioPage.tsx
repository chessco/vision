// ─── Brand Studio Page ───────────────────────────────────────────
// Complete brand management with tabbed interface.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Save, Loader2, Palette, Plus, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { toApiTenantId } from '../../../lib/api';
import { PageHeader, GlassPanel, TabBar, EmptyState, LoadingSpinner } from '../../../components/ui';
import { useTranslation } from 'react-i18next';

type BrandTab = 'overview' | 'personality' | 'visual' | 'rules' | 'competitors';

export function BrandStudioPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<BrandTab>('overview');
  const [images, setImages] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4',
    accentColor: '#f59e0b',
    styleGuidelines: '',
    toneOfVoice: '',
    brandVoice: '',
    communicationStyle: '',
    allowedTerms: '' as string,
    forbiddenTerms: '' as string,
    ctaStyle: '',
    competitors: '',
  });

  const handleAutoFill = () => {
    const brandName = formData.name || 'TechNova Solutions';
    setFormData({
      name: brandName,
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      styleGuidelines: 'Moderno, minimalista y orientado a la tecnología. Líneas limpias, amplio espacio en blanco y fotografía profesional.',
      toneOfVoice: 'Autoritario pero accesible. Explicamos conceptos técnicos complejos en términos sencillos.',
      brandVoice: 'Innovador y confiable',
      communicationStyle: 'Claro, conciso y con visión de futuro',
      allowedTerms: 'Innovación\nPreparado para el futuro\nEscalable\nAsociación\nEmpoderar',
      forbiddenTerms: 'Barato\nHack\nMagia\nDe la noche a la mañana\nGarantizado',
      ctaStyle: 'Directo y orientado al valor (ej. "Comienza a escalar hoy")',
      competitors: 'Acme Corp, Globex',
    });
  };

  const handleImageUpload = (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImages(prev => ({ ...prev, [label]: url }));
    }
  };

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await axios.get(`/api/tenants/${apiTenantId}/brand`);
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            primaryColor: res.data.primaryColor || '#8b5cf6',
            styleGuidelines: res.data.styleGuidelines || '',
            toneOfVoice: res.data.toneOfVoice || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching brand:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [apiTenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`/api/tenants/${apiTenantId}/brand`, {
        primaryColor: formData.primaryColor,
        styleGuidelines: formData.styleGuidelines,
        toneOfVoice: formData.toneOfVoice,
      });
      alert(t('Cambios guardados correctamente'));
    } catch (err) {
      console.error('Error saving brand:', err);
      alert(t('Error al guardar los cambios. Verifica que la base de datos esté corriendo.'));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: t('Overview'), icon: Eye },
    { id: 'personality', label: t('Personality'), icon: Palette },
    { id: 'visual', label: t('Visual Identity'), icon: Palette },
    { id: 'rules', label: t('Rules'), icon: ShieldCheck },
    { id: 'competitors', label: t('Competitors'), icon: Eye },
  ];

  if (loading) return <LoadingSpinner label="Loading brand studio..." fullPage />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Palette}
        title={t('Brand Studio')}
        description={t('Define your brand identity, voice, and visual guidelines for AI-powered content generation.')}
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleAutoFill}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm border border-indigo-500/30"
            >
              <Sparkles className="w-4 h-4" />
              {t('AI Autofill')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t('Saving...') : t('Save Changes')}
            </button>
          </div>
        }
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as BrandTab)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">{t('Brand Identity')}</h3>
              <div className="space-y-3">
                <InputField label={t('Brand Name')} value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder={t('e.g. AAA Abogados')} />
                <InputField label={t('Brand Voice')} value={formData.brandVoice} onChange={(v) => setFormData({ ...formData, brandVoice: v })} placeholder={t('e.g. Professional yet approachable')} />
                <InputField label={t('Communication Style')} value={formData.communicationStyle} onChange={(v) => setFormData({ ...formData, communicationStyle: v })} placeholder={t('e.g. Educational, empathetic, solution-oriented')} />
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">{t('Color Palette')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <ColorPicker label={t('Primary')} value={formData.primaryColor} onChange={(v) => setFormData({ ...formData, primaryColor: v })} />
                <ColorPicker label={t('Secondary')} value={formData.secondaryColor} onChange={(v) => setFormData({ ...formData, secondaryColor: v })} />
                <ColorPicker label={t('Accent')} value={formData.accentColor} onChange={(v) => setFormData({ ...formData, accentColor: v })} />
              </div>
              <div className="flex gap-2 mt-4">
                {[formData.primaryColor, formData.secondaryColor, formData.accentColor].map((c, i) => (
                  <div key={i} className="flex-1 h-12 rounded-lg border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </GlassPanel>
          </div>
        )}

        {activeTab === 'personality' && (
          <div className="space-y-6 stagger-children">
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">{t('Tone of Voice')}</h3>
              <TextareaField value={formData.toneOfVoice} onChange={(v) => setFormData({ ...formData, toneOfVoice: v })} placeholder={t('Describe how your brand speaks. e.g. Technical but educational, uses data-backed claims, avoids jargon...')} rows={4} />
            </GlassPanel>
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">{t('CTA Style')}</h3>
              <TextareaField value={formData.ctaStyle} onChange={(v) => setFormData({ ...formData, ctaStyle: v })} placeholder={t('How should calls-to-action be phrased? e.g. Action-oriented, urgency without pressure...')} rows={3} />
            </GlassPanel>
          </div>
        )}

        {activeTab === 'visual' && (
          <GlassPanel className="p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-headings font-semibold text-white">{t('Visual Style Guidelines')}</h3>
            <TextareaField value={formData.styleGuidelines} onChange={(v) => setFormData({ ...formData, styleGuidelines: v })} placeholder={t('Define visual aesthetics for AI generation. e.g. Realistic photography style, warm lighting, cinematic compositions, avoid illustrations...')} rows={6} />
            <div className="grid grid-cols-4 gap-3 mt-4">
              {['Logo', 'Logo Dark', 'Favicon', 'Watermark'].map((label) => (
                <label key={label} className="relative aspect-square rounded-lg border-2 border-dashed border-border-subtle hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-ink-muted hover:text-primary transition-colors cursor-pointer overflow-hidden group">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(label, e)} />
                  {images[label] ? (
                    <>
                      <img src={images[label]} alt={label} className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[10px] font-labels text-white">{t('Cambiar')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-labels">{t(label)}</span>
                    </>
                  )}
                </label>
              ))}
            </div>
          </GlassPanel>
        )}

        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {t('Allowed Terms')}
              </h3>
              <TextareaField value={formData.allowedTerms} onChange={(v) => setFormData({ ...formData, allowedTerms: v })} placeholder={t('Words, phrases, and terms the AI should use. One per line.')} rows={6} />
            </GlassPanel>
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white flex items-center gap-2">
                <span className="text-red-400">✗</span> {t('Forbidden Terms')}
              </h3>
              <TextareaField value={formData.forbiddenTerms} onChange={(v) => setFormData({ ...formData, forbiddenTerms: v })} placeholder={t('Words, phrases, and terms the AI must never use. One per line.')} rows={6} />
            </GlassPanel>
          </div>
        )}

        {activeTab === 'competitors' && (
          <GlassPanel className="p-6 animate-fade-in">
            <EmptyState
              icon={Eye}
              title={t('Competitor Analysis')}
              description={t('Add competitors to monitor their strategies and get AI-powered competitive insights.')}
              action={{ label: t('Add Competitor'), onClick: () => {} }}
            />
          </GlassPanel>
        )}
      </form>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────
function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ink-muted">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-background border border-border-subtle rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors" />
    </div>
  );
}

function TextareaField({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full bg-background border border-border-subtle rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ink-muted">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-background border border-border-subtle rounded p-1.5 text-white text-xs font-mono focus:outline-none focus:border-primary" />
      </div>
    </div>
  );
}
