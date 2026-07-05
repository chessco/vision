// ─── Brand Studio Page ───────────────────────────────────────────
// Complete brand management with tabbed interface.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Save, Loader2, Palette, Plus, Eye, ShieldCheck } from 'lucide-react';
import { toApiTenantId } from '../../../lib/api';
import { PageHeader, GlassPanel, TabBar, EmptyState, LoadingSpinner } from '../../../components/ui';

type BrandTab = 'overview' | 'personality' | 'visual' | 'rules' | 'competitors';

export function BrandStudioPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<BrandTab>('overview');
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
    } catch (err) {
      console.error('Error saving brand:', err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'personality', label: 'Personality', icon: Palette },
    { id: 'visual', label: 'Visual Identity', icon: Palette },
    { id: 'rules', label: 'Rules', icon: ShieldCheck },
    { id: 'competitors', label: 'Competitors', icon: Eye },
  ];

  if (loading) return <LoadingSpinner label="Loading brand studio..." fullPage />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Palette}
        title="Brand Studio"
        description="Define your brand identity, voice, and visual guidelines for AI-powered content generation."
        actions={
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition-all text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      <TabBar tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as BrandTab)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">Brand Identity</h3>
              <div className="space-y-3">
                <InputField label="Brand Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. AAA Abogados" />
                <InputField label="Brand Voice" value={formData.brandVoice} onChange={(v) => setFormData({ ...formData, brandVoice: v })} placeholder="e.g. Professional yet approachable" />
                <InputField label="Communication Style" value={formData.communicationStyle} onChange={(v) => setFormData({ ...formData, communicationStyle: v })} placeholder="e.g. Educational, empathetic, solution-oriented" />
              </div>
            </GlassPanel>

            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">Color Palette</h3>
              <div className="grid grid-cols-3 gap-4">
                <ColorPicker label="Primary" value={formData.primaryColor} onChange={(v) => setFormData({ ...formData, primaryColor: v })} />
                <ColorPicker label="Secondary" value={formData.secondaryColor} onChange={(v) => setFormData({ ...formData, secondaryColor: v })} />
                <ColorPicker label="Accent" value={formData.accentColor} onChange={(v) => setFormData({ ...formData, accentColor: v })} />
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
              <h3 className="text-lg font-headings font-semibold text-white">Tone of Voice</h3>
              <TextareaField value={formData.toneOfVoice} onChange={(v) => setFormData({ ...formData, toneOfVoice: v })} placeholder="Describe how your brand speaks. e.g. Technical but educational, uses data-backed claims, avoids jargon..." rows={4} />
            </GlassPanel>
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white">CTA Style</h3>
              <TextareaField value={formData.ctaStyle} onChange={(v) => setFormData({ ...formData, ctaStyle: v })} placeholder="How should calls-to-action be phrased? e.g. Action-oriented, urgency without pressure..." rows={3} />
            </GlassPanel>
          </div>
        )}

        {activeTab === 'visual' && (
          <GlassPanel className="p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-headings font-semibold text-white">Visual Style Guidelines</h3>
            <TextareaField value={formData.styleGuidelines} onChange={(v) => setFormData({ ...formData, styleGuidelines: v })} placeholder="Define visual aesthetics for AI generation. e.g. Realistic photography style, warm lighting, cinematic compositions, avoid illustrations..." rows={6} />
            <div className="grid grid-cols-4 gap-3 mt-4">
              {['Logo', 'Logo Dark', 'Favicon', 'Watermark'].map((label) => (
                <div key={label} className="aspect-square rounded-lg border-2 border-dashed border-border-subtle hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-ink-muted hover:text-primary transition-colors cursor-pointer">
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-labels">{label}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        )}

        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Allowed Terms
              </h3>
              <TextareaField value={formData.allowedTerms} onChange={(v) => setFormData({ ...formData, allowedTerms: v })} placeholder="Words, phrases, and terms the AI should use. One per line." rows={6} />
            </GlassPanel>
            <GlassPanel className="p-6 space-y-4">
              <h3 className="text-lg font-headings font-semibold text-white flex items-center gap-2">
                <span className="text-red-400">✗</span> Forbidden Terms
              </h3>
              <TextareaField value={formData.forbiddenTerms} onChange={(v) => setFormData({ ...formData, forbiddenTerms: v })} placeholder="Words, phrases, and terms the AI must never use. One per line." rows={6} />
            </GlassPanel>
          </div>
        )}

        {activeTab === 'competitors' && (
          <GlassPanel className="p-6 animate-fade-in">
            <EmptyState
              icon={Eye}
              title="Competitor Analysis"
              description="Add competitors to monitor their strategies and get AI-powered competitive insights."
              action={{ label: 'Add Competitor', onClick: () => {} }}
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
