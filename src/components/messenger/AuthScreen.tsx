import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { CyberInput } from './ui';
import type { User, AuthView } from './types';

export function AuthScreen({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ login: '', username: '', password: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (view === 'login') {
        if (!form.login || !form.password) { setError('Введите никнейм и пароль'); setLoading(false); return; }
        const res = await api.login({ login: form.login, password: form.password });
        if (res.error) { setError(res.error); setLoading(false); return; }
        localStorage.setItem('inferno_token', res.token);
        onLogin(res.user, res.token);
      } else {
        if (!form.username || !form.password) { setError('Введите никнейм и пароль'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Пароль минимум 6 символов'); setLoading(false); return; }
        const fakeEmail = `${form.username}@inferno.app`;
        const res = await api.register({ username: form.username, email: fakeEmail, password: form.password, display_name: form.username });
        if (res.error) { setError(res.error); setLoading(false); return; }
        localStorage.setItem('inferno_token', res.token);
        onLogin(res.user, res.token);
      }
    } catch {
      setError('Ошибка соединения. Попробуй ещё раз.');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-void flex items-center justify-center scanlines noise hex-bg">
      <div className="w-full max-w-sm px-6 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded border border-neon-red mx-auto flex items-center justify-center mb-4 shadow-neon-red">
            <span className="text-3xl text-neon-red">☠</span>
          </div>
          <h1 className="font-orbitron text-2xl text-white font-black tracking-widest glitch-text" data-text="INFERNO">INFERNO</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">ЗАЩИЩЁННЫЙ МЕССЕНДЖЕР // E2E</p>
        </div>

        <div className="flex mb-6 border border-void-border rounded overflow-hidden">
          {(['login', 'register'] as AuthView[]).map(t => (
            <button
              key={t}
              onClick={() => { setView(t); setError(''); }}
              className={`flex-1 py-2 text-xs font-orbitron tracking-widest transition-colors ${view === t ? 'bg-neon-red text-white' : 'text-muted-foreground hover:text-white'}`}
            >
              {t === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {view === 'register' && (
            <CyberInput placeholder="Никнейм (только латиница, цифры)" value={form.username} onChange={v => set('username', v)} icon="AtSign" />
          )}
          {view === 'login' && (
            <CyberInput placeholder="Никнейм" value={form.login} onChange={v => set('login', v)} icon="User" />
          )}
          <CyberInput placeholder="Пароль (мин. 6 символов)" value={form.password} onChange={v => set('password', v)} icon="Lock" type="password" onEnter={submit} />
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded border border-neon-red/30 bg-neon-red/5 flex items-center gap-2">
            <Icon name="AlertTriangle" size={12} className="text-neon-red flex-shrink-0" />
            <span className="text-xs font-mono text-neon-red">{error}</span>
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-4 py-3 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors flex items-center justify-center gap-2 shadow-neon-red disabled:opacity-50"
        >
          {loading
            ? <><span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" /></>
            : (view === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ')}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Icon name="Shield" size={10} className="text-neon-green" />
          <span className="text-xs font-mono text-neon-green/60">end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}
