import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const AVATARS = {
  me: 'https://cdn.poehali.dev/projects/79062c9a-1b37-4816-a7ea-2e09c700ab4a/files/0491a617-1a46-420a-a835-ecbc34b7dfa0.jpg',
  v: 'https://cdn.poehali.dev/projects/79062c9a-1b37-4816-a7ea-2e09c700ab4a/files/190d5062-fb6b-449f-8922-0c66f1525967.jpg',
  skull: 'https://cdn.poehali.dev/projects/79062c9a-1b37-4816-a7ea-2e09c700ab4a/files/50a169c8-8afd-4970-b0d0-bf7c3c8d177b.jpg',
};

type View = 'chats' | 'chat' | 'profile' | 'settings' | 'notifications';
type MessageType = 'text' | 'image' | 'encrypted';

interface Message {
  id: string;
  text?: string;
  image?: string;
  type: MessageType;
  sender: 'me' | 'them';
  time: string;
  encrypted: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'V∆LKYRIE_X',
    avatar: AVATARS.v,
    status: 'online',
    lastMessage: 'Файлы зашифрованы. Передача завершена.',
    lastTime: '23:44',
    unread: 3,
    messages: [
      { id: 'm1', text: 'Система активирована. Канал защищён.', type: 'encrypted', sender: 'them', time: '23:31', encrypted: true },
      { id: 'm2', text: 'Передаю координаты объекта.', type: 'text', sender: 'them', time: '23:38', encrypted: true },
      { id: 'm3', text: 'Принято. Выхожу на позицию.', type: 'text', sender: 'me', time: '23:40', encrypted: true },
      { id: 'm4', text: 'Файлы зашифрованы. Передача завершена.', type: 'text', sender: 'them', time: '23:44', encrypted: true },
    ]
  },
  {
    id: '2',
    name: 'SK∪LL_D3MON',
    avatar: AVATARS.skull,
    status: 'away',
    lastMessage: '// connection_timeout',
    lastTime: '21:17',
    unread: 0,
    messages: [
      { id: 'm5', text: 'Пробил защиту периметра.', type: 'text', sender: 'them', time: '21:10', encrypted: true },
      { id: 'm6', text: 'Жди сигнала.', type: 'text', sender: 'me', time: '21:12', encrypted: true },
      { id: 'm7', text: '// connection_timeout', type: 'text', sender: 'them', time: '21:17', encrypted: true },
    ]
  },
  {
    id: '3',
    name: 'GHOST_PR0T0COL',
    avatar: '',
    status: 'offline',
    lastMessage: 'Данные удалены. Следов нет.',
    lastTime: '18:05',
    unread: 1,
    messages: [
      { id: 'm8', text: 'Операция завершена. Без потерь.', type: 'text', sender: 'them', time: '18:00', encrypted: true },
      { id: 'm9', text: 'Данные удалены. Следов нет.', type: 'text', sender: 'them', time: '18:05', encrypted: true },
    ]
  },
  {
    id: '4',
    name: 'N3ON_WITCH',
    avatar: '',
    status: 'online',
    lastMessage: 'Новый код активирован ✦',
    lastTime: '16:33',
    unread: 0,
    messages: [
      { id: 'm10', text: 'Ритуал завершён. Система под контролем.', type: 'text', sender: 'them', time: '16:30', encrypted: true },
      { id: 'm11', text: 'Новый код активирован ✦', type: 'text', sender: 'them', time: '16:33', encrypted: true },
    ]
  },
];

const NOTIFICATIONS = [
  { id: 'n1', icon: 'Shield', text: 'E2E шифрование активировано', time: '23:44', color: 'neon-green' },
  { id: 'n2', icon: 'MessageSquare', text: 'V∆LKYRIE_X: 3 новых сообщения', time: '23:44', color: 'neon-red' },
  { id: 'n3', icon: 'AlertTriangle', text: 'Попытка перехвата заблокирована', time: '22:11', color: 'neon-blue' },
  { id: 'n4', icon: 'Lock', text: 'Ключи шифрования обновлены', time: '20:00', color: 'neon-green' },
  { id: 'n5', icon: 'User', text: 'GHOST_PR0T0COL вышел в сеть', time: '18:05', color: 'neon-blue' },
];

const SETTINGS_SECTIONS = [
  { icon: 'Lock', label: 'E2E Шифрование', value: 'АКТИВНО', on: true },
  { icon: 'Eye', label: 'Скрывать онлайн-статус', value: 'ВЫКЛ', on: false },
  { icon: 'Trash2', label: 'Автоудаление сообщений', value: '7 ДНЕЙ', on: true },
  { icon: 'Bell', label: 'Push-уведомления', value: 'ВКЛ', on: true },
  { icon: 'Fingerprint', label: 'Биометрическая защита', value: 'ВЫКЛ', on: false },
  { icon: 'Wifi', label: 'Анонимная сеть (TOR)', value: 'ВЫКЛ', on: false },
];

function StatusDot({ status }: { status: 'online' | 'offline' | 'away' }) {
  const colors: Record<string, string> = {
    online: 'bg-neon-green pulse-online',
    offline: 'bg-void-border',
    away: 'bg-yellow-500',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
}

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name.replace(/[^A-ZА-Я]/g, '').slice(0, 2) || name.slice(0, 2).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded flex items-center justify-center flex-shrink-0 bg-void-elevated border border-void-border font-orbitron font-bold text-neon-red"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  );
}

function NavBtn({ icon, label, active, badge, onClick }: { icon: string; label: string; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative w-9 h-9 rounded flex items-center justify-center transition-all ${
        active
          ? 'bg-neon-red/10 border border-neon-red/50 text-neon-red shadow-neon-red'
          : 'text-muted-foreground hover:text-white hover:bg-void-elevated border border-transparent'
      }`}
    >
      <Icon name={icon} size={16} />
      {badge && badge > 0 ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full text-white text-xs flex items-center justify-center font-bold shadow-neon-red">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}

export default function Index() {
  const [view, setView] = useState<View>('chats');
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [inputText, setInputText] = useState('');
  const [settings, setSettings] = useState(SETTINGS_SECTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeContact?.messages, view]);

  const openChat = (contact: Contact) => {
    const updated = contacts.map(c => c.id === contact.id ? { ...c, unread: 0 } : c);
    setContacts(updated);
    setActiveContact({ ...contact, unread: 0 });
    setView('chat');
  };

  const sendMessage = () => {
    if (!inputText.trim() || !activeContact) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      text: inputText,
      type: 'text',
      sender: 'me',
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
    };
    const updatedContact = { ...activeContact, messages: [...activeContact.messages, newMsg], lastMessage: inputText, lastTime: newMsg.time };
    setActiveContact(updatedContact);
    setContacts(prev => prev.map(c => c.id === activeContact.id ? updatedContact : c));
    setInputText('');
  };

  const sendImage = (file: File) => {
    if (!activeContact) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newMsg: Message = {
        id: `m-${Date.now()}`,
        image: reader.result as string,
        type: 'image',
        sender: 'me',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        encrypted: true,
      };
      const updatedContact = { ...activeContact, messages: [...activeContact.messages, newMsg], lastMessage: '[ИЗОБРАЖЕНИЕ]', lastTime: newMsg.time };
      setActiveContact(updatedContact);
      setContacts(prev => prev.map(c => c.id === activeContact.id ? updatedContact : c));
    };
    reader.readAsDataURL(file);
  };

  const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="scanlines noise flex h-screen w-screen bg-void overflow-hidden select-none">
      {/* Left sidebar - Navigation */}
      <div className="w-14 flex flex-col items-center py-4 gap-2 border-r border-void-border bg-void z-10">
        <div className="mb-4 flex flex-col items-center">
          <div className="w-9 h-9 rounded border border-neon-red flex items-center justify-center shadow-neon-red">
            <span className="font-orbitron text-neon-red text-base font-black">☠</span>
          </div>
        </div>

        <NavBtn icon="MessageSquare" label="Чаты" active={view === 'chats' || view === 'chat'} badge={totalUnread} onClick={() => setView('chats')} />
        <NavBtn icon="Bell" label="Уведомления" active={view === 'notifications'} badge={2} onClick={() => setView('notifications')} />
        <NavBtn icon="User" label="Профиль" active={view === 'profile'} onClick={() => setView('profile')} />

        <div className="mt-auto">
          <NavBtn icon="Settings" label="Настройки" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* === CHATS LIST === */}
        {(view === 'chats' || view === 'chat') && (
          <div className={`w-72 flex flex-col border-r border-void-border bg-void-surface ${view === 'chat' ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-void-border">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-orbitron text-white font-bold text-sm tracking-widest">КОНТАКТЫ</h1>
                <span className="text-xs font-mono flex items-center gap-1">
                  <Icon name="Shield" size={10} className="text-neon-green" />
                  <span className="text-neon-green encrypt-badge">E2E</span>
                </span>
              </div>
              <div className="relative">
                <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full bg-void-elevated border border-void-border rounded pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-muted-foreground cyber-input transition-colors"
                  placeholder="поиск_контактов..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {contacts.map((contact, i) => (
                <button
                  key={contact.id}
                  onClick={() => openChat(contact)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-void-elevated transition-colors border-b border-void-border/50 text-left group animate-fade-in-up ${activeContact?.id === contact.id && view === 'chat' ? 'bg-void-elevated border-l-2 border-l-neon-red' : ''}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={contact.avatar} name={contact.name} size={40} />
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <StatusDot status={contact.status} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron text-xs text-white font-semibold truncate group-hover:text-neon-red transition-colors">
                        {contact.name}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground ml-1 flex-shrink-0">{contact.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate font-mono">{contact.lastMessage}</span>
                      {contact.unread > 0 && (
                        <span className="ml-1 flex-shrink-0 w-4 h-4 rounded-full bg-neon-red text-white text-xs font-bold flex items-center justify-center shadow-neon-red">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-void-border flex items-center gap-2">
              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                <img src={AVATARS.me} className="w-full h-full object-cover" alt="me" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-orbitron text-white font-semibold">D3MON_USER</p>
                <p className="text-xs font-mono text-neon-green">● В СЕТИ</p>
              </div>
              <Icon name="Shield" size={14} className="text-neon-green" />
            </div>
          </div>
        )}

        {/* === CHAT WINDOW === */}
        {view === 'chat' && activeContact && (
          <div className="flex-1 flex flex-col bg-void hex-bg">
            <div className="px-4 py-3 border-b border-void-border flex items-center gap-3 bg-void-surface">
              <button onClick={() => setView('chats')} className="md:hidden text-muted-foreground hover:text-white transition-colors mr-1">
                <Icon name="ChevronLeft" size={18} />
              </button>
              <div className="relative">
                <Avatar src={activeContact.avatar} name={activeContact.name} size={36} />
                <span className="absolute -bottom-0.5 -right-0.5"><StatusDot status={activeContact.status} /></span>
              </div>
              <div className="flex-1">
                <h2 className="font-orbitron text-sm text-white font-bold">{activeContact.name}</h2>
                <p className="text-xs font-mono text-muted-foreground">
                  {activeContact.status === 'online'
                    ? <span className="text-neon-green">● онлайн</span>
                    : activeContact.status === 'away'
                    ? <span className="text-yellow-500">◐ недоступен</span>
                    : <span>○ офлайн</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded border border-neon-green/30 bg-neon-green/5">
                  <Icon name="Lock" size={10} className="text-neon-green" />
                  <span className="text-neon-green text-xs font-mono encrypt-badge">ЗАШИФРОВАНО</span>
                </div>
                <button className="text-muted-foreground hover:text-neon-red transition-colors">
                  <Icon name="MoreVertical" size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-px flex-1 bg-void-border" />
                <span className="text-xs font-mono px-2 flex items-center gap-1">
                  <Icon name="Shield" size={10} className="text-neon-green" />
                  <span className="text-neon-green/70">E2E канал активирован</span>
                </span>
                <div className="h-px flex-1 bg-void-border" />
              </div>

              {activeContact.messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  style={{ animation: `${msg.sender === 'me' ? 'message-in' : 'message-in-left'} 0.25s ease-out forwards`, animationDelay: `${i * 30}ms` }}
                >
                  {msg.sender === 'them' && (
                    <div className="mr-2 flex-shrink-0">
                      <Avatar src={activeContact.avatar} name={activeContact.name} size={28} />
                    </div>
                  )}
                  <div className="max-w-xs lg:max-w-md">
                    <div className={`rounded px-3 py-2 ${
                      msg.sender === 'me'
                        ? 'bg-neon-red/10 border border-neon-red/30 text-white'
                        : 'bg-void-elevated border border-void-border text-white'
                    }`}>
                      {msg.type === 'image' && msg.image ? (
                        <img src={msg.image} alt="sent" className="rounded max-w-[200px] max-h-[200px] object-cover" />
                      ) : (
                        <p className="text-sm font-sans leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs font-mono text-muted-foreground">{msg.time}</span>
                      {msg.encrypted && <Icon name="Lock" size={8} className="text-neon-green/60" />}
                      {msg.sender === 'me' && <Icon name="CheckCheck" size={10} className="text-neon-blue/60" />}
                    </div>
                  </div>
                </div>
              ))}

              {activeContact.status === 'online' && (
                <div className="flex items-center gap-2">
                  <Avatar src={activeContact.avatar} name={activeContact.name} size={28} />
                  <div className="bg-void-elevated border border-void-border rounded px-3 py-2 flex gap-1 items-center">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-void-border bg-void-surface">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && sendImage(e.target.files[0])}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded flex items-center justify-center border border-void-border hover:border-neon-red hover:text-neon-red text-muted-foreground transition-colors flex-shrink-0"
                >
                  <Icon name="Image" size={14} />
                </button>
                <input
                  className="flex-1 bg-void-elevated border border-void-border rounded px-3 py-2 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input transition-colors"
                  placeholder="Введите сообщение... [зашифровано]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="w-8 h-8 rounded flex items-center justify-center bg-neon-red hover:bg-red-700 transition-colors flex-shrink-0 shadow-neon-red"
                >
                  <Icon name="Send" size={14} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Icon name="Lock" size={9} className="text-neon-green/50" />
                <span className="text-xs font-mono text-neon-green/50">end-to-end шифрование активно</span>
              </div>
            </div>
          </div>
        )}

        {/* === CHATS EMPTY STATE === */}
        {view === 'chats' && (
          <div className="flex-1 flex items-center justify-center bg-void hex-bg">
            <div className="text-center animate-fade-in-up corner-box p-12">
              <div className="w-16 h-16 rounded border border-neon-red/30 flex items-center justify-center mx-auto mb-6 shadow-neon-red">
                <Icon name="MessageSquare" size={28} className="text-neon-red" />
              </div>
              <h2 className="font-orbitron text-white font-bold mb-2 tracking-widest">INFERNO CHAT</h2>
              <p className="text-sm font-mono text-muted-foreground">Выберите контакт для начала<br/>зашифрованного сеанса</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Icon name="Shield" size={12} className="text-neon-green" />
                <span className="text-xs font-mono text-neon-green/70">256-bit E2E encryption</span>
              </div>
            </div>
          </div>
        )}

        {/* === NOTIFICATIONS === */}
        {view === 'notifications' && (
          <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
            <div className="p-6 border-b border-void-border">
              <h1 className="font-orbitron text-white font-bold text-sm tracking-widest mb-1">УВЕДОМЛЕНИЯ</h1>
              <p className="text-xs font-mono text-muted-foreground">Системные события и оповещения</p>
            </div>
            <div className="p-4 space-y-2">
              {NOTIFICATIONS.map((n, i) => (
                <div
                  key={n.id}
                  className="flex items-center gap-4 p-4 bg-void-elevated border border-void-border rounded hover:border-neon-red/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                    n.color === 'neon-red' ? 'bg-neon-red/10 border border-neon-red/30' :
                    n.color === 'neon-green' ? 'bg-neon-green/10 border border-neon-green/30' :
                    'bg-neon-blue/10 border border-neon-blue/30'
                  }`}>
                    <Icon name={n.icon} size={14} className={
                      n.color === 'neon-red' ? 'text-neon-red' :
                      n.color === 'neon-green' ? 'text-neon-green' :
                      'text-neon-blue'
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-sans">{n.text}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PROFILE === */}
        {view === 'profile' && (
          <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
            <div className="p-6 border-b border-void-border">
              <h1 className="font-orbitron text-white font-bold text-sm tracking-widest">ПРОФИЛЬ</h1>
            </div>
            <div className="p-6 flex flex-col items-center animate-fade-in-up">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded border-2 border-neon-red overflow-hidden shadow-neon-red">
                  <img src={AVATARS.me} alt="profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-neon-red rounded flex items-center justify-center shadow-neon-red hover:bg-red-700 transition-colors">
                  <Icon name="Camera" size={12} className="text-white" />
                </button>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full pulse-online" />
              </div>

              <h2 className="font-orbitron text-xl text-white font-black mb-1 glitch-text" data-text="D3MON_USER">D3MON_USER</h2>
              <p className="text-xs font-mono text-neon-green mb-1">● В СЕТИ</p>
              <p className="text-xs font-mono text-muted-foreground mb-6">ID: 7X2F9-K4M1L-INFERNO</p>

              <div className="w-full max-w-sm bg-void-elevated border border-void-border rounded p-4 mb-4">
                <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">Статус</p>
                <p className="text-sm text-white font-sans">// Анонимность — это свобода. Безопасность — это право.</p>
              </div>

              <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-4">
                {[['247', 'Сообщений'], ['4', 'Контактов'], ['100%', 'Зашифровано']].map(([val, label]) => (
                  <div key={label} className="bg-void-elevated border border-void-border rounded p-3 text-center">
                    <p className="font-orbitron text-lg text-neon-red font-black">{val}</p>
                    <p className="text-xs font-mono text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-sm space-y-2">
                <button className="w-full py-2.5 rounded border border-neon-red/30 bg-neon-red/5 text-neon-red font-orbitron text-xs tracking-widest hover:bg-neon-red/10 transition-colors flex items-center justify-center gap-2">
                  <Icon name="Edit3" size={12} />
                  РЕДАКТИРОВАТЬ ПРОФИЛЬ
                </button>
                <button className="w-full py-2.5 rounded border border-void-border text-muted-foreground font-orbitron text-xs tracking-widest hover:border-neon-red/30 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Icon name="Share2" size={12} />
                  ПОДЕЛИТЬСЯ КОНТАКТОМ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === SETTINGS === */}
        {view === 'settings' && (
          <div className="flex-1 flex flex-col bg-void hex-bg overflow-y-auto">
            <div className="p-6 border-b border-void-border">
              <h1 className="font-orbitron text-white font-bold text-sm tracking-widest mb-1">НАСТРОЙКИ</h1>
              <p className="text-xs font-mono text-muted-foreground">Конфиденциальность и безопасность</p>
            </div>
            <div className="p-4 space-y-2 max-w-lg">
              {settings.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center gap-4 p-4 bg-void-elevated border border-void-border rounded hover:border-neon-red/30 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-8 h-8 rounded border border-void-border flex items-center justify-center flex-shrink-0">
                    <Icon name={s.icon} size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-sans">{s.label}</p>
                    <p className={`text-xs font-mono ${s.on ? 'text-neon-green' : 'text-muted-foreground'}`}>{s.value}</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev.map((item, idx) => idx === i ? { ...item, on: !item.on, value: !item.on ? (item.value === 'ВЫКЛ' ? 'ВКЛ' : item.value) : 'ВЫКЛ' } : item))}
                    className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${s.on ? 'bg-neon-red shadow-neon-red' : 'bg-void-border'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${s.on ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}

              <div className="mt-6 p-4 border border-neon-red/20 rounded bg-neon-red/5">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={14} className="text-neon-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-orbitron text-neon-red font-bold mb-1">ОПАСНАЯ ЗОНА</p>
                    <p className="text-xs font-mono text-muted-foreground mb-3">Эти действия необратимы</p>
                    <button className="text-xs font-orbitron text-neon-red border border-neon-red/30 rounded px-3 py-1.5 hover:bg-neon-red/10 transition-colors">
                      УДАЛИТЬ ВСЕ ДАННЫЕ
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