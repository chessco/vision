import React, { useState, useCallback, useEffect } from 'react';
import {
  Settings, Wifi, RefreshCw, CheckCircle2,
  AlertCircle, Server, Database, Key, Globe, ChevronRight,
  Sparkles, Lock, Activity, Pencil
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConnectionTest {
  status: 'idle' | 'testing' | 'ok' | 'error';
  latency?: number;
  version?: string;
  message?: string;
}

const STORAGE_KEY_URLS = 'pitaya_vision_connection_urls';
const STORAGE_KEY_ACTIVE = 'pitaya_vision_active_connection';

const DEFAULT_PROD_URL = 'https://pitayacore-api.pitayacode.io';
const DEFAULT_LOCAL_URL = 'http://localhost:3014';

function loadUrls(): { prod: string; local: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_URLS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { prod: DEFAULT_PROD_URL, local: DEFAULT_LOCAL_URL };
}

function saveUrls(urls: { prod: string; local: string }) {
  localStorage.setItem(STORAGE_KEY_URLS, JSON.stringify(urls));
}

function loadActiveConnection(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE);
}

function saveActiveConnection(url: string) {
  localStorage.setItem(STORAGE_KEY_ACTIVE, url);
}

export function SettingsPage() {
  const [urls, setUrls] = useState(loadUrls);
  const [prodTest, setProdTest] = useState<ConnectionTest>({ status: 'idle' });
  const [localTest, setLocalTest] = useState<ConnectionTest>({ status: 'idle' });
  const [activeUrl, setActiveUrl] = useState<string | null>(loadActiveConnection);
  const [editingProd, setEditingProd] = useState(false);
  const [editingLocal, setEditingLocal] = useState(false);
  const [tempProdUrl, setTempProdUrl] = useState(urls.prod);
  const [tempLocalUrl, setTempLocalUrl] = useState(urls.local);
  const { t } = useTranslation();

  useEffect(() => {
    saveUrls(urls);
  }, [urls]);

  const testConnection = useCallback(async (
    url: string,
    setter: React.Dispatch<React.SetStateAction<ConnectionTest>>
  ) => {
    setter({ status: 'testing' });
    const start = Date.now();
    try {
      const proxyUrl = `/api/health-check?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'x-api-key': import.meta.env.VITE_PITAYACORE_API_KEY || '',
          'x-user-role': 'ADMIN',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      const latency = Date.now() - start;

      if (res.ok) {
        let version: string | undefined;
        try {
          const data = await res.json();
          version = data?.data?.version || data?.data?.status || 'OK';
        } catch { version = 'OK'; }
        setter({ status: 'ok', latency, version });
        setActiveUrl(url);
        saveActiveConnection(url);
        window.dispatchEvent(new CustomEvent('pitaya-connection-changed', { detail: { url } }));
      } else {
        let msg: string;
        try {
          const errData = await res.json();
          msg = errData?.message || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
          msg = `HTTP ${res.status}: ${res.statusText}`;
        }
        setter({ status: 'error', message: msg, latency });
      }
    } catch (err: any) {
      const latency = Date.now() - start;
      const msg = err?.name === 'TimeoutError'
        ? t('Timeout: El servidor no respondió en 8s')
        : err?.message || t('No se pudo conectar');
      setter({ status: 'error', message: msg, latency });
    }
  }, [t]);

  const StatusBadge = ({ test }: { test: ConnectionTest }) => {
    if (test.status === 'idle') return (
      <span className="text-xs text-ink-muted font-labels">{t('Sin probar')}</span>
    );
    if (test.status === 'testing') return (
      <span className="flex items-center gap-1.5 text-xs text-primary font-labels">
        <RefreshCw className="w-3 h-3 animate-spin" /> {t('Probando...')}
      </span>
    );
    if (test.status === 'ok') return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-labels font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t('Conectado')} · {test.latency}ms · {test.version}
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400 font-labels font-semibold">
        <AlertCircle className="w-3.5 h-3.5" />
        {t('Error')}: {test.message}
      </span>
    );
  };

  const ConnectionCard = ({
    title, subtitle, url, icon: Icon, test, onTest, accent, isEditing, tempUrl, onTempUrlChange, onEdit, onSave, onCancel
  }: {
    title: string;
    subtitle: string;
    url: string;
    icon: React.ElementType;
    test: ConnectionTest;
    onTest: () => void;
    accent: 'primary' | 'secondary';
    isEditing: boolean;
    tempUrl: string;
    onTempUrlChange: (url: string) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
  }) => {
    const isActive = activeUrl === url;
    const borderColor = isActive ? 'border-primary/50' :
      test.status === 'ok' ? 'border-emerald-500/30' :
      test.status === 'error' ? 'border-red-500/30' :
      test.status === 'testing' ? 'border-primary/40' : 'border-border-subtle';

    return (
      <div className={`glass-panel rounded-xl p-5 border transition-all duration-300 ${borderColor} ${isActive ? 'bg-primary/5' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{t(title)}</h3>
                {isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded">{t('ACTIVA')}</span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{t(subtitle)}</p>
              {isEditing ? (
                <div className="mt-2 flex items-center gap-2">
                  <Globe className="w-3 h-3 text-ink-muted/50 shrink-0" />
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => onTempUrlChange(e.target.value)}
                    className="flex-1 bg-paper border border-border-subtle rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <button
                    onClick={onSave}
                    className="px-2 py-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                  >
                    {t('Guardar')}
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-2 py-1 text-[10px] font-medium bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    {t('Cancelar')}
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1.5 group">
                  <Globe className="w-3 h-3 text-ink-muted/50" />
                  <code className="text-[10px] text-ink-muted/70 font-mono tracking-tight">{url}</code>
                  <button
                    onClick={onEdit}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity"
                  >
                    <Pencil className="w-3 h-3 text-ink-muted/50" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onTest}
            disabled={test.status === 'testing' || isEditing}
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-60 ${
              accent === 'primary'
                ? 'bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20'
                : 'bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/20'
            }`}
          >
            {test.status === 'testing'
              ? <><RefreshCw className="w-3 h-3 animate-spin" />{t('Probando')}</>
              : <><Wifi className="w-3 h-3" />{t('Probar')}</>
            }
          </button>
        </div>

        {/* Progress / Result bar */}
        <div className={`mt-4 pt-4 border-t border-border-subtle/50 flex items-center gap-2 ${test.status === 'idle' ? 'opacity-50' : ''}`}>
          {test.status === 'testing' && (
            <div className="w-full h-1 bg-border-subtle rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[ping_1s_ease-in-out_infinite] rounded-full w-1/3" />
            </div>
          )}
          {test.status !== 'testing' && <StatusBadge test={test} />}
        </div>

        {/* Latency meter if connected */}
        {test.status === 'ok' && test.latency !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-ink-muted mb-1">
              <span>{t('Latencia')}</span>
              <span className={test.latency < 300 ? 'text-emerald-400' : test.latency < 800 ? 'text-yellow-400' : 'text-red-400'}>
                {test.latency < 300 ? `🟢 ${t('Excelente')}` : test.latency < 800 ? `🟡 ${t('Aceptable')}` : `🔴 ${t('Alta')}`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${test.latency < 300 ? 'bg-emerald-500' : test.latency < 800 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (test.latency / 1500) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-3xl">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-headings font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          {t('Configuración')}
        </h1>
        <p className="text-ink-muted text-sm">{t('Administra la conectividad y configuración del sistema.')}</p>
      </header>

      {/* Section: PitayaCore Connection */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">
            {t('Conectividad — PitayaCore API')}
          </h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <ConnectionCard
          title="PitayaCore — Producción"
          subtitle="Motor central de IA, agentes, créditos y activos."
          url={urls.prod}
          icon={Server}
          test={prodTest}
          onTest={() => testConnection(urls.prod, setProdTest)}
          accent="primary"
          isEditing={editingProd}
          tempUrl={tempProdUrl}
          onTempUrlChange={setTempProdUrl}
          onEdit={() => { setTempProdUrl(urls.prod); setEditingProd(true); }}
          onSave={() => { setUrls({ ...urls, prod: tempProdUrl }); setEditingProd(false); }}
          onCancel={() => { setEditingProd(false); setTempProdUrl(urls.prod); }}
        />

        <ConnectionCard
          title="PitayaCore — Local"
          subtitle="Instancia de desarrollo local (puerto 3014)."
          url={urls.local}
          icon={Database}
          test={localTest}
          onTest={() => testConnection(urls.local, setLocalTest)}
          accent="secondary"
          isEditing={editingLocal}
          tempUrl={tempLocalUrl}
          onTempUrlChange={setTempLocalUrl}
          onEdit={() => { setTempLocalUrl(urls.local); setEditingLocal(true); }}
          onSave={() => { setUrls({ ...urls, local: tempLocalUrl }); setEditingLocal(false); }}
          onCancel={() => { setEditingLocal(false); setTempLocalUrl(urls.local); }}
        />
      </section>

      {/* Section: Environment Info */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">
            {t('Información del Entorno')}
          </h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <div className="glass-panel rounded-xl p-5 border border-border-subtle space-y-3">
          {[
            { label: t('Versión de Pitaya Visual'), value: 'MVP 1.0 — Refactor Sprint', icon: Sparkles },
            { label: t('URL de PitayaCore (Prod)'), value: urls.prod, icon: Globe },
            { label: t('Conexión Activa'), value: activeUrl || t('Ninguna (probar para activar)'), icon: Activity },
            { label: t('Modo'), value: import.meta.env.MODE || 'production', icon: Lock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-0">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              <code className="text-xs text-white/80 font-mono bg-paper px-2 py-0.5 rounded">{value}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Next Steps */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-labels font-semibold text-ink-muted uppercase tracking-wider">
            {t('Siguientes Pasos de Integración')}
          </h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <div className="glass-panel rounded-xl border border-border-subtle overflow-hidden">
          {[
            { done: true,  label: t('Frontend refactorizado como Director Creativo IA') },
            { done: true,  label: t('Schema de BD (MySQL) limpiado y regenerado') },
            { done: true,  label: t('Módulo vision-campaigns añadido a PitayaCore') },
            { done: false, label: t('Conectar Creative Chat al Agente de PitayaCore (romper mock)') },
            { done: false, label: t('Integrar Credit Engine en el flujo de generación') },
            { done: false, label: t('Activar generación de imágenes real (Fal.ai / Replicate)') },
          ].map(({ done, label }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle/50 last:border-0 hover:bg-white/2 transition-colors"
            >
              {done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                : <div className="w-4 h-4 rounded-full border border-border-subtle shrink-0" />
              }
              <span className={`text-sm ${done ? 'line-through text-ink-muted' : 'text-white'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
