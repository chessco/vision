import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    localStorage.setItem('pitaya_vision_user', JSON.stringify({ email }));

    const tenantId = 'default';
    navigate(`/t/${tenantId}/visual/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-panel border border-border/50 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-bold text-center text-ink-text mb-2">
          {t('Pitaya Vision')}
        </h1>
        <p className="text-ink-subtext text-center mb-8">
          {t('Inicia sesión para acceder a tu suite creativa.')}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-subtext mb-1">
              {t('Correo Electrónico')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('usuario@pitayacode.io')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-subtext mb-1">
              {t('Contraseña')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-ink-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t('••••••••')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-background font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('Entrar al Workspace')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
