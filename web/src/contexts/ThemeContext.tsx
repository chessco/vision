import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

export interface ThemeToken {
  name: string;
  value: string;
  type: string;
}

export interface ThemeConfig {
  whiteLabel: {
    appName: string;
    companyName: string;
    logo: string | null;
    favicon: string | null;
  };
  activeTheme: {
    name: string;
    mode: 'LIGHT' | 'DARK' | 'AUTO';
    tokens: ThemeToken[];
  };
}

export type ThemeSource = 'pitayacore' | 'cached' | 'local';
export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error';

interface ThemeContextType {
  config: ThemeConfig | null;
  activeSource: ThemeSource;
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
  useLocalTheme: () => void;
}

const STORAGE_KEY_CACHE = 'pitaya_vision_cached_theme';
const STORAGE_KEY_LAST_SYNC = 'pitaya_vision_last_theme_sync';
const STORAGE_KEY_SOURCE = 'pitaya_vision_active_theme_source';

const DEFAULT_LOCAL_THEME_TOKENS: ThemeToken[] = [
  { name: 'primary', value: '#8b5cf6', type: 'color' },
  { name: 'primary-container', value: '#1e1b29', type: 'color' },
  { name: 'secondary', value: '#06b6d4', type: 'color' },
  { name: 'secondary-container', value: '#083344', type: 'color' },
  { name: 'accent', value: '#f59e0b', type: 'color' },
  { name: 'accent-container', value: '#451a03', type: 'color' },
  { name: 'background', value: '#0b0a0f', type: 'color' },
  { name: 'surface', value: '#13111c', type: 'color' },
  { name: 'text-primary', value: '#f3f4f6', type: 'color' },
  { name: 'text-secondary', value: '#9ca3af', type: 'color' },
  { name: 'border', value: '#262235', type: 'color' },
  { name: 'radius', value: '0.375rem', type: 'radius' },
];

const DEFAULT_LOCAL_THEME_CONFIG: ThemeConfig = {
  whiteLabel: {
    appName: 'Vision Creative OS',
    companyName: 'PitayaCode',
    logo: null,
    favicon: null,
  },
  activeTheme: {
    name: 'Vision Default (Local)',
    mode: 'DARK',
    tokens: DEFAULT_LOCAL_THEME_TOKENS,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [activeSource, setActiveSource] = useState<ThemeSource>('local');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply CSS variables to root element
  const applyThemeTokens = (tokens: ThemeToken[]) => {
    const root = document.documentElement;

    // Build unique list of token variable names we want to clean/write
    const variableNames = tokens.map(t => t.name);

    // Clear previous custom variables starting with --theme- or direct names
    const variablesToRemove: string[] = [];
    for (let i = 0; i < root.style.length; i++) {
      const key = root.style[i];
      if (
        key.startsWith('--theme-') ||
        variableNames.includes(key.substring(2)) ||
        [
          'primary', 'primary-container', 'secondary', 'secondary-container',
          'accent', 'accent-container', 'background', 'surface',
          'text-primary', 'text-secondary', 'border', 'radius'
        ].includes(key.substring(2))
      ) {
        variablesToRemove.push(key);
      }
    }
    variablesToRemove.forEach(v => root.style.removeProperty(v));

    // Apply new tokens
    tokens.forEach(token => {
      root.style.setProperty(`--theme-${token.name}`, token.value);
      root.style.setProperty(`--${token.name}`, token.value);
    });
  };

  const loadFromCache = (): boolean => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CACHE);
      const savedSource = localStorage.getItem(STORAGE_KEY_SOURCE) as ThemeSource | null;
      const lastSync = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
      
      if (cached && savedSource !== 'local') {
        const parsed: ThemeConfig = JSON.parse(cached);
        setConfig(parsed);
        applyThemeTokens(parsed.activeTheme.tokens);
        setActiveSource('cached');
        if (lastSync) setLastSyncTime(lastSync);
        return true;
      }
    } catch (e) {
      console.error('Failed to load theme from cache', e);
    }
    return false;
  };

  const useLocalTheme = () => {
    setConfig(DEFAULT_LOCAL_THEME_CONFIG);
    applyThemeTokens(DEFAULT_LOCAL_THEME_TOKENS);
    setActiveSource('local');
    localStorage.setItem(STORAGE_KEY_SOURCE, 'local');
  };

  const refreshTheme = async () => {
    setSyncStatus('syncing');
    try {
      // Fetch combined theme configuration through the Vision NestJS proxy
      const res = await axios.get<ThemeConfig>('/api/design/white-label/config');
      
      setConfig(res.data);
      applyThemeTokens(res.data.activeTheme.tokens);
      setActiveSource('pitayacore');
      setSyncStatus('ok');

      const now = new Date().toLocaleString();
      setLastSyncTime(now);

      // Cache it
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(res.data));
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
      localStorage.setItem(STORAGE_KEY_SOURCE, 'pitayacore');
    } catch (e) {
      console.error('Error synchronizing with PitayaCore theme engine:', e);
      setSyncStatus('error');
      
      // Fallback
      const loadedCache = loadFromCache();
      if (!loadedCache) {
        useLocalTheme();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Attempt to load cache first to prevent flash of unstyled content
    loadFromCache();
    const savedSource = localStorage.getItem(STORAGE_KEY_SOURCE) as ThemeSource | null;

    if (savedSource === 'local') {
      useLocalTheme();
      setIsLoading(false);
    } else {
      // Async refresh from PitayaCore
      refreshTheme();
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      config,
      activeSource,
      syncStatus,
      lastSyncTime,
      isLoading,
      refreshTheme,
      useLocalTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeEngine() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeEngine must be used within a ThemeProvider');
  }
  return context;
}
