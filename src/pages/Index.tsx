import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  email: string;
}

interface Contact {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  online_status: string;
  last_message: string;
  last_time: string;
  unread: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string | null;
  image_url: string | null;
  msg_type: string;
  time: string;
}

type View = 'chats' | 'chat' | 'profile' | 'settings' | 'notifications' | 'add-contact';
type AuthView = 'login' | 'register';

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }: { onLogin: (user: User, token: string) => void }) {
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded border border-neon-red mx-auto flex items-center justify-center mb-4 shadow-neon-red">
            <span className="text-3xl text-neon-red">☠</span>
          </div>
          <h1 className="font-orbitron text-2xl text-white font-black tracking-widest glitch-text" data-text="INFERNO">INFERNO</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">ЗАЩИЩЁННЫЙ МЕССЕНДЖЕР // E2E</p>
        </div>

        {/* Tabs */}
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

        {/* Form */}
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
          {loading ? <><span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-white" /></> : (view === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ')}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Icon name="Shield" size={10} className="text-neon-green" />
          <span className="text-xs font-mono text-neon-green/60">end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}

function CyberInput({ placeholder, value, onChange, icon, type = 'text', onEnter }: {
  placeholder: string; value: string; onChange: (v: string) => void;
  icon?: string; type?: string; onEnter?: () => void;
}) {
  return (
    <div className="relative">
      {icon && <Icon name={icon} size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        className={`w-full bg-void-elevated border border-void-border rounded py-2.5 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input transition-colors ${icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  const initials = name.replace(/[^A-Za-zА-Яа-я]/g, '').slice(0, 2).toUpperCase() || name.slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} className="rounded object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded flex items-center justify-center flex-shrink-0 bg-void-elevated border border-void-border font-orbitron font-bold text-neon-red" style={{ width: size, height: size, fontSize: Math.max(10, size * 0.3) }}>
      {initials}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${status === 'online' ? 'bg-neon-green pulse-online' : status === 'away' ? 'bg-yellow-500' : 'bg-void-border'}`} />;
}

function NavBtn({ icon, label, active, badge, onClick }: { icon: string; label: string; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} className={`relative w-9 h-9 rounded flex items-center justify-center transition-all ${active ? 'bg-neon-red/10 border border-neon-red/50 text-neon-red shadow-neon-red' : 'text-muted-foreground hover:text-white hover:bg-void-elevated border border-transparent'}`}>
      <Icon name={icon} size={16} />
      {badge && badge > 0 ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full text-white text-xs flex items-center justify-center font-bold shadow-neon-red">{badge > 9 ? '9+' : badge}</span> : null}
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<View>('chats');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('inferno_token');
    if (!token) { setAuthChecked(true); return; }
    api.checkToken().then(res => {
      if (res.user) setUser(res.user);
      setAuthChecked(true);
    });
  }, []);

  // Load contacts when logged in
  const loadContacts = useCallback(async () => {
    const res = await api.getContacts();
    if (res.contacts) setContacts(res.contacts);
  }, []);

  useEffect(() => {
    if (user) loadContacts();
  }, [user, loadContacts]);

  // Poll messages
  useEffect(() => {
    if (!activeContact || view !== 'chat') return;
    const load = async () => {
      const res = await api.getMessages(activeContact.id);
      if (res.messages) setMessages(res.messages);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [activeContact, view]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = (u: User) => setUser(u);

  const openChat = async (contact: Contact) => {
    setActiveContact(contact);
    setView('chat');
    const res = await api.getMessages(contact.id);
    if (res.messages) setMessages(res.messages);
    await api.markRead(contact.id);
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeContact) return;
    const text = inputText;
    setInputText('');
    const res = await api.sendMessage({ receiver_id: activeContact.id, text });
    if (res.message) {
      setMessages(prev => [...prev, res.message]);
      loadContacts();
    }
  };

  const sendImage = (file: File) => {
    if (!activeContact) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const data = reader.result as string;
      const ext = file.name.split('.').pop() || 'jpg';
      const res = await api.sendMessage({ receiver_id: activeContact.id, image: data, ext });
      if (res.message) {
        setMessages(prev => [...prev, res.message]);
        loadContacts();
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const data = reader.result as string;
      const ext = file.name.split('.').pop() || 'jpg';
      const res = await api.uploadAvatar(data, ext);
      if (res.avatar_url) setUser(u => u ? { ...u, avatar_url: res.avatar_url } : u);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    const res = await api.updateProfile({ display_name: editName, status: editStatus });
    if (res.user) setUser(res.user);
    setProfileSaving(false);
  };

  const addContact = async () => {
    if (!addUsername.trim()) return;
    setAddLoading(true); setAddError('');
    const res = await api.addContact(addUsername.trim());
    if (res.error) { setAddError(res.error); }
    else { setAddUsername(''); await loadContacts(); setView('chats'); }
    setAddLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('inferno_token');
    setUser(null);
    setContacts([]);
    setMessages([]);
    setActiveContact(null);
    setView('chats');
  };

  if (!authChecked) return (
    <div className="h-screen w-screen bg-void flex items-center justify-center">
      <div className="flex gap-1.5">
        <span className="typing-dot w-2 h-2 rounded-full bg-neon-red" />
        <span className="typing-dot w-2 h-2 rounded-full bg-neon-red" />
        <span className="typing-dot w-2 h-2 rounded-full bg-neon-red" />
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);
  const filteredContacts = contacts.filter(c =>
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="scanlines noise flex h-screen w-screen bg-void overflow-hidden select-none">
      {/* Left sidebar */}
      <div className="w-14 flex flex-col items-center py-4 gap-2 border-r border-void-border bg-void z-10">
        <div className="mb-4">
          <div className="w-9 h-9 rounded border border-neon-red flex items-center justify-center shadow-neon-red">
            <span className="font-orbitron text-neon-red text-base font-black">☠</span>
          </div>
        </div>
        <NavBtn icon="MessageSquare" label="Чаты" active={view === 'chats' || view === 'chat'} badge={totalUnread} onClick={() => setView('chats')} />
        <NavBtn icon="UserPlus" label="Добавить контакт" active={view === 'add-contact'} onClick={() => setView('add-contact')} />
        <NavBtn icon="User" label="Профиль" active={view === 'profile'} onClick={() => { setEditName(user.display_name); setEditStatus(user.status); setView('profile'); }} />
        <div className="mt-auto">
          <NavBtn icon="Settings" label="Настройки" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Contacts sidebar */}
        {(view === 'chats' || view === 'chat') && (
          <div className={`w-72 flex flex-col border-r border-void-border bg-void-surface ${view === 'chat' ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-void-border">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-orbitron text-white font-bold text-sm tracking-widest">КОНТАКТЫ</h1>
                <span className="flex items-center gap-1"><Icon name="Shield" size={10} className="text-neon-green" /><span className="text-neon-green text-xs font-mono encrypt-badge">E2E</span></span>
              </div>
              <div className="relative">
                <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="w-full bg-void-elevated border border-void-border rounded pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-muted-foreground cyber-input" placeholder="поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 && (
                <div className="p-6 text-center">
                  <Icon name="Users" size={24} className="text-void-border mx-auto mb-2" />
                  <p className="text-xs font-mono text-muted-foreground">Нет контактов</p>
                  <button onClick={() => setView('add-contact')} className="mt-2 text-xs font-orbitron text-neon-red hover:underline">+ Добавить</button>
                </div>
              )}
              {filteredContacts.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => openChat(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-void-elevated transition-colors border-b border-void-border/50 text-left group animate-fade-in-up ${activeContact?.id === c.id && view === 'chat' ? 'bg-void-elevated border-l-2 border-l-neon-red' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={c.avatar_url} name={c.display_name} size={40} />
                    <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={c.online_status} /></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron text-xs text-white font-semibold truncate group-hover:text-neon-red transition-colors">{c.display_name}</span>
                      <span className="text-xs font-mono text-muted-foreground ml-1 flex-shrink-0">{c.last_time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate font-mono">{c.last_message}</span>
                      {c.unread > 0 && <span className="ml-1 w-4 h-4 rounded-full bg-neon-red text-white text-xs font-bold flex items-center justify-center shadow-neon-red flex-shrink-0">{c.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-void-border flex items-center gap-2">
              <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0">
                <Avatar src={user.avatar_url} name={user.display_name} size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-orbitron text-white font-semibold truncate">{user.display_name}</p>
                <p className="text-xs font-mono text-neon-green">● В СЕТИ</p>
              </div>
              <Icon name="Shield" size={12} className="text-neon-green flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Chat window */}
        {view === 'chat' && activeContact && (
          <div className="flex-1 flex flex-col bg-void hex-bg">
            <div className="px-4 py-3 border-b border-void-border flex items-center gap-3 bg-void-surface">
              <button onClick={() => setView('chats')} className="md:hidden text-muted-foreground hover:text-white mr-1"><Icon name="ChevronLeft" size={18} /></button>
              <div className="relative">
                <Avatar src={activeContact.avatar_url} name={activeContact.display_name} size={36} />
                <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={activeContact.online_status} /></span>
              </div>
              <div className="flex-1">
                <h2 className="font-orbitron text-sm text-white font-bold">{activeContact.display_name}</h2>
                <p className="text-xs font-mono text-muted-foreground">@{activeContact.username}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded border border-neon-green/30 bg-neon-green/5">
                <Icon name="Lock" size={10} className="text-neon-green" />
                <span className="text-neon-green text-xs font-mono encrypt-badge">E2E</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-px flex-1 bg-void-border" />
                <span className="text-xs font-mono px-2 flex items-center gap-1 text-neon-green/50">
                  <Icon name="Shield" size={10} className="text-neon-green" /> E2E канал защищён
                </span>
                <div className="h-px flex-1 bg-void-border" />
              </div>

              {messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && <div className="mr-2 flex-shrink-0"><Avatar src={activeContact.avatar_url} name={activeContact.display_name} size={28} /></div>}
                    <div className="max-w-xs lg:max-w-md">
                      <div className={`rounded px-3 py-2 ${isMe ? 'bg-neon-red/10 border border-neon-red/30' : 'bg-void-elevated border border-void-border'}`}>
                        {msg.msg_type === 'image' && msg.image_url
                          ? <img src={msg.image_url} alt="img" className="rounded max-w-[200px] max-h-[200px] object-cover" />
                          : <p className="text-sm font-sans text-white leading-relaxed">{msg.text}</p>}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-mono text-muted-foreground">{msg.time}</span>
                        <Icon name="Lock" size={8} className="text-neon-green/60" />
                        {isMe && <Icon name="CheckCheck" size={10} className="text-neon-blue/60" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-void-border bg-void-surface">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && sendImage(e.target.files[0])} />
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded border border-void-border hover:border-neon-red hover:text-neon-red text-muted-foreground transition-colors flex items-center justify-center flex-shrink-0">
                  <Icon name="Image" size={14} />
                </button>
                <input
                  className="flex-1 bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input"
                  placeholder="Сообщение... [зашифровано]"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="w-8 h-8 rounded bg-neon-red hover:bg-red-700 transition-colors flex items-center justify-center flex-shrink-0 shadow-neon-red">
                  <Icon name="Send" size={14} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Icon name="Lock" size={9} className="text-neon-green/40" />
                <span className="text-xs font-mono text-neon-green/40">end-to-end шифрование активно</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty chat state */}
        {view === 'chats' && (
          <div className="flex-1 flex items-center justify-center bg-void hex-bg">
            <div className="text-center corner-box p-12 animate-fade-in-up">
              <div className="w-16 h-16 rounded border border-neon-red/30 flex items-center justify-center mx-auto mb-6 shadow-neon-red">
                <Icon name="MessageSquare" size={28} className="text-neon-red" />
              </div>
              <h2 className="font-orbitron text-white font-bold mb-2 tracking-widest">INFERNO CHAT</h2>
              <p className="text-sm font-mono text-muted-foreground">Выберите контакт для начала<br />зашифрованного сеанса</p>
              <button onClick={() => setView('add-contact')} className="mt-4 text-xs font-orbitron text-neon-red border border-neon-red/30 rounded px-4 py-2 hover:bg-neon-red/10 transition-colors">
                + ДОБАВИТЬ КОНТАКТ
              </button>
            </div>
          </div>
        )}

        {/* Add contact */}
        {view === 'add-contact' && (
          <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
            <div className="p-6 border-b border-void-border">
              <h1 className="font-orbitron text-white font-bold text-sm tracking-widest mb-1">ДОБАВИТЬ КОНТАКТ</h1>
              <p className="text-xs font-mono text-muted-foreground">Введите никнейм пользователя</p>
            </div>
            <div className="p-6 max-w-sm animate-fade-in-up">
              <div className="relative mb-3">
                <Icon name="AtSign" size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full bg-void-elevated border border-void-border rounded pl-8 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-muted-foreground cyber-input"
                  placeholder="username"
                  value={addUsername}
                  onChange={e => setAddUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addContact()}
                />
              </div>
              {addError && (
                <div className="mb-3 px-3 py-2 rounded border border-neon-red/30 bg-neon-red/5 flex items-center gap-2">
                  <Icon name="AlertTriangle" size={12} className="text-neon-red" />
                  <span className="text-xs font-mono text-neon-red">{addError}</span>
                </div>
              )}
              <button onClick={addContact} disabled={addLoading} className="w-full py-2.5 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors flex items-center justify-center gap-2 shadow-neon-red disabled:opacity-50">
                <Icon name="UserPlus" size={12} />
                {addLoading ? 'ПОИСК...' : 'ДОБАВИТЬ'}
              </button>
            </div>
          </div>
        )}

        {/* Profile */}
        {view === 'profile' && (
          <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
            <div className="p-6 border-b border-void-border flex items-center justify-between">
              <h1 className="font-orbitron text-white font-bold text-sm tracking-widest">ПРОФИЛЬ</h1>
              <button onClick={logout} className="text-xs font-orbitron text-muted-foreground hover:text-neon-red transition-colors flex items-center gap-1">
                <Icon name="LogOut" size={12} /> ВЫЙТИ
              </button>
            </div>
            <div className="p-6 flex flex-col items-center animate-fade-in-up">
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded border-2 border-neon-red overflow-hidden shadow-neon-red">
                  <Avatar src={user.avatar_url} name={user.display_name} size={96} />
                </div>
                <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-neon-red rounded flex items-center justify-center shadow-neon-red hover:bg-red-700 transition-colors">
                  <Icon name="Camera" size={12} className="text-white" />
                </button>
              </div>

              <p className="text-xs font-mono text-neon-green mb-1">● В СЕТИ</p>
              <p className="text-xs font-mono text-muted-foreground mb-6">@{user.username}</p>

              <div className="w-full max-w-sm space-y-3 mb-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Отображаемое имя</p>
                  <input
                    className="w-full bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Статус</p>
                  <input
                    className="w-full bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  />
                </div>
                <button onClick={saveProfile} disabled={profileSaving} className="w-full py-2.5 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors shadow-neon-red disabled:opacity-50 flex items-center justify-center gap-2">
                  <Icon name="Save" size={12} />
                  {profileSaving ? 'СОХРАНЯЮ...' : 'СОХРАНИТЬ'}
                </button>
              </div>

              <div className="w-full max-w-sm p-4 bg-void-elevated border border-void-border rounded">
                <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Email</p>
                <p className="text-sm font-mono text-white">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {view === 'settings' && (
          <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
            <div className="p-6 border-b border-void-border">
              <h1 className="font-orbitron text-white font-bold text-sm tracking-widest mb-1">НАСТРОЙКИ</h1>
              <p className="text-xs font-mono text-muted-foreground">Конфиденциальность и безопасность</p>
            </div>
            <div className="p-4 space-y-2 max-w-lg">
              <SettingRow icon="Lock" label="E2E Шифрование" value="АКТИВНО" active />
              <SettingRow icon="Shield" label="Защита данных" value="ВКЛ" active />
              <SettingRow icon="Bell" label="Уведомления" value="ВКЛ" active />
              <SettingRow icon="Eye" label="Статус онлайн" value="ВИДЕН" active />

              <div className="mt-6 p-4 border border-neon-red/20 rounded bg-neon-red/5">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={14} className="text-neon-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-orbitron text-neon-red font-bold mb-1">АККАУНТ</p>
                    <button onClick={logout} className="text-xs font-orbitron text-neon-red border border-neon-red/30 rounded px-3 py-1.5 hover:bg-neon-red/10 transition-colors flex items-center gap-1">
                      <Icon name="LogOut" size={10} /> ВЫЙТИ ИЗ СИСТЕМЫ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value, active }: { icon: string; label: string; value: string; active: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-void-elevated border border-void-border rounded">
      <div className="w-8 h-8 rounded border border-void-border flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white font-sans">{label}</p>
        <p className={`text-xs font-mono ${active ? 'text-neon-green' : 'text-muted-foreground'}`}>{value}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-neon-green pulse-online' : 'bg-void-border'}`} />
    </div>
  );
}