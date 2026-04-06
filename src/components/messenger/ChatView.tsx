import { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Avatar, StatusDot, NavBtn, SettingRow } from './ui';
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

interface ChatWindowProps {
  activeContact: Contact;
  messages: Message[];
  inputText: string;
  userId: number;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onSendImage: (f: File) => void;
}

export function ChatWindow({ activeContact, messages, inputText, userId, messagesEndRef, onBack, onInputChange, onSend, onSendImage }: ChatWindowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 flex flex-col bg-void hex-bg">
      <div className="px-4 py-3 border-b border-void-border flex items-center gap-3 bg-void-surface">
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
          const isMe = msg.sender_id === userId;
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
            className="flex-1 bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input"
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
}

export function ProfileView({ user, editName, editStatus, profileSaving, avatarInputRef, onEditNameChange, onEditStatusChange, onSave, onUploadAvatar, onLogout }: ProfileViewProps) {
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

        <div className="w-full max-w-sm space-y-3 mb-4">
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
