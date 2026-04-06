import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Avatar, StatusDot, NavBtn, SettingRow } from './ui';
import { CHAT_THEMES, MSG_FONTS } from './types';
import type { User, Contact, Message, View } from './types';

interface ContactsSidebarProps {
  view: View;
  contacts: Contact[];
  activeContact: Contact | null;
  searchQuery: string;
  user: User;
  onSearchChange: (v: string) => void;
  onOpenChat: (c: Contact) => void;
  onAddContact: () => void;
}

export function ContactsSidebar({ view, contacts, activeContact, searchQuery, user, onSearchChange, onOpenChat, onAddContact }: ContactsSidebarProps) {
  return (
    <div className={`w-72 flex flex-col border-r border-void-border bg-void-surface ${view === 'chat' ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-void-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-orbitron text-white font-bold text-sm tracking-widest">КОНТАКТЫ</h1>
          <span className="flex items-center gap-1">
            <Icon name="Shield" size={10} className="text-neon-green" />
            <span className="text-neon-green text-xs font-mono encrypt-badge">E2E</span>
          </span>
        </div>
        <div className="relative">
          <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full bg-void-elevated border border-void-border rounded pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-muted-foreground cyber-input"
            placeholder="поиск..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 && (
          <div className="p-6 text-center">
            <Icon name="Users" size={24} className="text-void-border mx-auto mb-2" />
            <p className="text-xs font-mono text-muted-foreground">Нет контактов</p>
            <button onClick={onAddContact} className="mt-2 text-xs font-orbitron text-neon-red hover:underline">+ Добавить</button>
          </div>
        )}
        {contacts.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onOpenChat(c)}
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
  );
}

function getMsgFontClass(fontId?: string): string {
  const font = MSG_FONTS.find(f => f.id === fontId);
  return font ? font.className : 'font-sans';
}

interface ChatWindowProps {
  activeContact: Contact;
  messages: Message[];
  inputText: string;
  userId: number;
  userFont?: string;
  userTheme?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onSendImage: (f: File) => void;
  onDeleteChat: () => void;
}

export function ChatWindow({ activeContact, messages, inputText, userId, userFont, userTheme, messagesEndRef, onBack, onInputChange, onSend, onSendImage, onDeleteChat }: ChatWindowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const msgFontClass = getMsgFontClass(userFont);
  const themeClass = (!userTheme || userTheme === 'default') ? 'bg-void' : `theme-${userTheme}`;

  return (
    <div className={`flex-1 flex flex-col hex-bg ${themeClass}`}>
      <div className="px-4 py-3 border-b border-void-border flex items-center gap-3 bg-void-surface/90 backdrop-blur-sm">
        <button onClick={onBack} className="md:hidden text-muted-foreground hover:text-white mr-1">
          <Icon name="ChevronLeft" size={18} />
        </button>
        <div className="relative">
          <Avatar src={activeContact.avatar_url} name={activeContact.display_name} size={36} />
          <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={activeContact.online_status} /></span>
        </div>
        <div className="flex-1">
          <h2 className="font-orbitron text-sm text-white font-bold">{activeContact.display_name}</h2>
          <p className="text-xs font-mono text-muted-foreground">@{activeContact.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded border border-neon-green/30 bg-neon-green/5">
            <Icon name="Lock" size={10} className="text-neon-green" />
            <span className="text-neon-green text-xs font-mono encrypt-badge">E2E</span>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={() => { onDeleteChat(); setConfirmDelete(false); }} className="text-xs font-orbitron text-neon-red border border-neon-red/40 rounded px-2 py-1 hover:bg-neon-red/10">ДА</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs font-orbitron text-muted-foreground border border-void-border rounded px-2 py-1 hover:text-white">НЕТ</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} title="Удалить переписку" className="w-7 h-7 rounded border border-void-border hover:border-neon-red/50 hover:text-neon-red text-muted-foreground transition-colors flex items-center justify-center">
              <Icon name="Trash2" size={13} />
            </button>
          )}
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
          const isMe = msg.sender_id === userId;
          const applyFont = isMe ? msgFontClass : 'font-sans';
          const isGlitch = isMe && userFont === 'glitch';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="mr-2 flex-shrink-0">
                  <Avatar src={activeContact.avatar_url} name={activeContact.display_name} size={28} />
                </div>
              )}
              <div className="max-w-xs lg:max-w-md">
                <div className={`rounded px-3 py-2 ${isMe ? 'bg-neon-red/10 border border-neon-red/30' : 'bg-void-elevated border border-void-border'}`}>
                  {msg.msg_type === 'image' && msg.image_url
                    ? <img src={msg.image_url} alt="img" className="rounded max-w-[220px] max-h-[220px] object-cover cursor-pointer" onClick={() => window.open(msg.image_url!, '_blank')} />
                    : (
                      <p
                        className={`text-sm leading-relaxed ${applyFont} ${isGlitch ? 'msg-glitch' : ''}`}
                        data-text={msg.text || ''}
                      >
                        {msg.text}
                      </p>
                    )}
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

      <div className="px-4 py-3 border-t border-void-border bg-void-surface/90 backdrop-blur-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && onSendImage(e.target.files[0])}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded border border-void-border hover:border-neon-red hover:text-neon-red text-muted-foreground transition-colors flex items-center justify-center flex-shrink-0"
          >
            <Icon name="Image" size={14} />
          </button>
          <input
            className={`flex-1 bg-void-elevated border border-void-border rounded px-3 py-2 text-sm text-white placeholder:text-muted-foreground cyber-input ${msgFontClass}`}
            placeholder="Сообщение... [зашифровано]"
            value={inputText}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
          />
          <button
            onClick={onSend}
            className="w-8 h-8 rounded bg-neon-red hover:bg-red-700 transition-colors flex items-center justify-center flex-shrink-0 shadow-neon-red"
          >
            <Icon name="Send" size={14} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <Icon name="Lock" size={9} className="text-neon-green/40" />
          <span className="text-xs font-mono text-neon-green/40">end-to-end шифрование активно</span>
        </div>
      </div>
    </div>
  );
}

interface ProfileViewProps {
  user: User;
  editName: string;
  editStatus: string;
  profileSaving: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement>;
  onEditNameChange: (v: string) => void;
  onEditStatusChange: (v: string) => void;
  onSave: () => void;
  onUploadAvatar: (f: File) => void;
  onLogout: () => void;
  onThemeChange: (t: string) => void;
  onFontChange: (f: string) => void;
}

export function ProfileView({ user, editName, editStatus, profileSaving, avatarInputRef, onEditNameChange, onEditStatusChange, onSave, onUploadAvatar, onLogout, onThemeChange, onFontChange }: ProfileViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
      <div className="p-6 border-b border-void-border flex items-center justify-between">
        <h1 className="font-orbitron text-white font-bold text-sm tracking-widest">ПРОФИЛЬ</h1>
        <button onClick={onLogout} className="text-xs font-orbitron text-muted-foreground hover:text-neon-red transition-colors flex items-center gap-1">
          <Icon name="LogOut" size={12} /> ВЫЙТИ
        </button>
      </div>
      <div className="p-6 flex flex-col items-center animate-fade-in-up">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && onUploadAvatar(e.target.files[0])}
        />
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded border-2 border-neon-red overflow-hidden shadow-neon-red">
            <Avatar src={user.avatar_url} name={user.display_name} size={96} />
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-neon-red rounded flex items-center justify-center shadow-neon-red hover:bg-red-700 transition-colors"
          >
            <Icon name="Camera" size={12} className="text-white" />
          </button>
        </div>

        <p className="text-xs font-mono text-neon-green mb-1">● В СЕТИ</p>
        <p className="text-xs font-mono text-muted-foreground mb-6">@{user.username}</p>

        <div className="w-full max-w-sm space-y-3 mb-6">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Отображаемое имя</p>
            <input
              className="w-full bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input"
              value={editName}
              onChange={e => onEditNameChange(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Статус</p>
            <input
              className="w-full bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input"
              value={editStatus}
              onChange={e => onEditStatusChange(e.target.value)}
            />
          </div>
          <button
            onClick={onSave}
            disabled={profileSaving}
            className="w-full py-2.5 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors shadow-neon-red disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon name="Save" size={12} />
            {profileSaving ? 'СОХРАНЯЮ...' : 'СОХРАНИТЬ'}
          </button>
        </div>

        {/* Темы чата */}
        <div className="w-full max-w-sm mb-6">
          <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest flex items-center gap-1">
            <Icon name="Sparkles" size={10} /> Тема чата
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CHAT_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`p-2 rounded border text-center transition-all ${user.chat_theme === theme.id ? 'border-neon-red bg-neon-red/10' : 'border-void-border hover:border-void-border/80'}`}
              >
                <div className={`w-full h-6 rounded mb-1 theme-${theme.id} border border-white/10`} />
                <p className="text-xs font-orbitron text-white truncate">{theme.name}</p>
                <p className="text-xs font-mono text-muted-foreground truncate">{theme.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Шрифт сообщений */}
        <div className="w-full max-w-sm mb-6">
          <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest flex items-center gap-1">
            <Icon name="Type" size={10} /> Шрифт сообщений
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MSG_FONTS.map(font => (
              <button
                key={font.id}
                onClick={() => onFontChange(font.id)}
                className={`p-3 rounded border text-left transition-all ${user.msg_font === font.id ? 'border-neon-red bg-neon-red/10' : 'border-void-border hover:border-void-border/80'}`}
              >
                <p className="text-xs font-mono text-muted-foreground mb-1">{font.name}</p>
                <p
                  className={`text-sm text-white ${font.className} ${font.id === 'glitch' ? 'msg-glitch' : ''}`}
                  data-text={font.preview}
                >
                  {font.preview}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm p-4 bg-void-elevated border border-void-border rounded">
          <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Email</p>
          <p className="text-sm font-mono text-white">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

interface SettingsViewProps {
  onLogout: () => void;
}

export function SettingsView({ onLogout }: SettingsViewProps) {
  return (
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
              <button onClick={onLogout} className="text-xs font-orbitron text-neon-red border border-neon-red/30 rounded px-3 py-1.5 hover:bg-neon-red/10 transition-colors flex items-center gap-1">
                <Icon name="LogOut" size={10} /> ВЫЙТИ ИЗ СИСТЕМЫ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddContactViewProps {
  addUsername: string;
  addError: string;
  addLoading: boolean;
  onUsernameChange: (v: string) => void;
  onAdd: () => void;
}

export function AddContactView({ addUsername, addError, addLoading, onUsernameChange, onAdd }: AddContactViewProps) {
  return (
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
            onChange={e => onUsernameChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAdd()}
          />
        </div>
        {addError && (
          <div className="mb-3 px-3 py-2 rounded border border-neon-red/30 bg-neon-red/5 flex items-center gap-2">
            <Icon name="AlertTriangle" size={12} className="text-neon-red" />
            <span className="text-xs font-mono text-neon-red">{addError}</span>
          </div>
        )}
        <button
          onClick={onAdd}
          disabled={addLoading}
          className="w-full py-2.5 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors flex items-center justify-center gap-2 shadow-neon-red disabled:opacity-50"
        >
          <Icon name="UserPlus" size={12} />
          {addLoading ? 'ПОИСК...' : 'ДОБАВИТЬ'}
        </button>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  status: string;
  online_status: string;
  created_at: string;
}

interface AdminMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string | null;
  image_url: string | null;
  msg_type: string;
  time: string;
  sender_name: string;
  receiver_name: string;
}

import { api } from '@/lib/api';

export function AdminPanel() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('inferno_admin_token'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedPair, setSelectedPair] = useState<[number, number] | null>(null);
  const [chatMsgs, setChatMsgs] = useState<AdminMessage[]>([]);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loginAdmin = async () => {
    const res = await api.adminLogin(password);
    if (res.token) {
      localStorage.setItem('inferno_admin_token', res.token);
      setAuthed(true);
      loadUsers();
    } else {
      setLoginError('Неверный пароль');
    }
  };

  const loadUsers = async () => {
    const res = await api.adminGetUsers();
    if (res.users) setUsers(res.users);
  };

  const loadChat = async (a: number, b: number) => {
    setSelectedPair([a, b]);
    const res = await api.adminGetMessages(a, b);
    if (res.messages) setChatMsgs(res.messages);
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Удалить аккаунт?')) return;
    await api.adminDeleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setLoading(true);
    await api.adminEditUser({ id: editUser.id, display_name: editName, status: editStatus });
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, display_name: editName, status: editStatus } : u));
    setEditUser(null);
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-void hex-bg">
        <div className="w-full max-w-xs px-6 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded border border-neon-red mx-auto flex items-center justify-center mb-3 shadow-neon-red">
              <Icon name="ShieldAlert" size={24} className="text-neon-red" />
            </div>
            <h2 className="font-orbitron text-white font-bold tracking-widest">ADMIN ACCESS</h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">Введите пароль администратора</p>
          </div>
          <input
            type="password"
            className="w-full bg-void-elevated border border-void-border rounded px-3 py-2.5 text-sm font-mono text-white placeholder:text-muted-foreground cyber-input mb-3"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loginAdmin()}
          />
          {loginError && <p className="text-xs font-mono text-neon-red mb-3">{loginError}</p>}
          <button onClick={loginAdmin} className="w-full py-2.5 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors shadow-neon-red">
            ВОЙТИ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-void overflow-hidden">
      {/* Users list */}
      <div className="w-80 flex flex-col border-r border-void-border bg-void-surface">
        <div className="p-4 border-b border-void-border flex items-center justify-between">
          <div>
            <h2 className="font-orbitron text-white font-bold text-sm tracking-widest flex items-center gap-2">
              <Icon name="ShieldAlert" size={14} className="text-neon-red" /> ADMIN
            </h2>
            <p className="text-xs font-mono text-muted-foreground">{users.length} пользователей</p>
          </div>
          <button onClick={loadUsers} className="text-muted-foreground hover:text-white transition-colors">
            <Icon name="RefreshCw" size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 && (
            <div className="p-6 text-center">
              <button onClick={loadUsers} className="text-xs font-orbitron text-neon-red">Загрузить</button>
            </div>
          )}
          {users.map(u => (
            <div key={u.id} className="border-b border-void-border/50">
              <div className="px-4 py-3 flex items-center gap-3">
                <Avatar src={u.avatar_url} name={u.display_name} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron text-xs text-white font-semibold truncate">{u.display_name}</p>
                  <p className="text-xs font-mono text-muted-foreground">@{u.username}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditUser(u); setEditName(u.display_name); setEditStatus(u.status); }} className="w-6 h-6 rounded border border-void-border hover:border-neon-green/50 hover:text-neon-green text-muted-foreground transition-colors flex items-center justify-center">
                    <Icon name="Pencil" size={11} />
                  </button>
                  <button onClick={() => deleteUser(u.id)} className="w-6 h-6 rounded border border-void-border hover:border-neon-red/50 hover:text-neon-red text-muted-foreground transition-colors flex items-center justify-center">
                    <Icon name="Trash2" size={11} />
                  </button>
                </div>
              </div>
              {/* Read chat buttons */}
              <div className="px-4 pb-2 flex flex-wrap gap-1">
                {users.filter(other => other.id !== u.id).map(other => (
                  <button
                    key={other.id}
                    onClick={() => loadChat(u.id, other.id)}
                    className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${selectedPair?.[0] === u.id && selectedPair?.[1] === other.id ? 'border-neon-red text-neon-red' : 'border-void-border text-muted-foreground hover:text-white'}`}
                  >
                    ↔ @{other.username}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat viewer / Edit panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editUser ? (
          <div className="p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setEditUser(null)} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={16} /></button>
              <h2 className="font-orbitron text-white font-bold text-sm">Редактировать @{editUser.username}</h2>
            </div>
            <div className="max-w-sm space-y-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Отображаемое имя</p>
                <input className="w-full bg-void-elevated border border-void-border rounded px-3 py-2 text-sm text-white cyber-input" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-widest">Статус</p>
                <input className="w-full bg-void-elevated border border-void-border rounded px-3 py-2 text-sm text-white cyber-input" value={editStatus} onChange={e => setEditStatus(e.target.value)} />
              </div>
              <button onClick={saveEdit} disabled={loading} className="w-full py-2.5 rounded bg-neon-red hover:bg-red-700 text-white font-orbitron text-xs tracking-widest transition-colors shadow-neon-red disabled:opacity-50">
                {loading ? 'СОХРАНЯЮ...' : 'СОХРАНИТЬ'}
              </button>
            </div>
          </div>
        ) : selectedPair ? (
          <>
            <div className="px-4 py-3 border-b border-void-border bg-void-surface flex items-center gap-2">
              <Icon name="Eye" size={14} className="text-neon-red" />
              <span className="font-orbitron text-xs text-white">
                Переписка #{selectedPair[0]} ↔ #{selectedPair[1]}
              </span>
              <span className="text-xs font-mono text-muted-foreground ml-auto">{chatMsgs.length} сообщений</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {chatMsgs.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === selectedPair[0] ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md rounded px-3 py-2 border ${msg.sender_id === selectedPair[0] ? 'bg-neon-red/10 border-neon-red/30' : 'bg-void-elevated border-void-border'}`}>
                    <p className="text-xs font-mono text-muted-foreground mb-1">@{msg.sender_name} → {msg.time}</p>
                    {msg.msg_type === 'image' && msg.image_url
                      ? <img src={msg.image_url} alt="img" className="rounded max-w-[160px]" />
                      : <p className="text-sm text-white font-sans">{msg.text}</p>}
                  </div>
                </div>
              ))}
              {chatMsgs.length === 0 && <p className="text-center text-xs font-mono text-muted-foreground">Нет сообщений</p>}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon name="Eye" size={32} className="text-void-border mx-auto mb-3" />
              <p className="text-xs font-mono text-muted-foreground">Выберите пользователя и переписку</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export NavBtn so Index.tsx doesn't need to import from ui directly
export { NavBtn };
