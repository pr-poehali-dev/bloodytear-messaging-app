import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { NavBtn } from '@/components/messenger/ui';
import { AuthScreen } from '@/components/messenger/AuthScreen';
import { ContactsSidebar, ChatWindow, ProfileView, SettingsView, AddContactView } from '@/components/messenger/ChatView';
import type { User, Contact, Message, View } from '@/components/messenger/types';

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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('inferno_token');
    if (!token) { setAuthChecked(true); return; }
    api.checkToken().then(res => {
      if (res.user) setUser(res.user);
      setAuthChecked(true);
    });
  }, []);

  const loadContacts = useCallback(async () => {
    const res = await api.getContacts();
    if (res.contacts) setContacts(res.contacts);
  }, []);

  useEffect(() => {
    if (user) loadContacts();
  }, [user, loadContacts]);

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
        {(view === 'chats' || view === 'chat') && (
          <ContactsSidebar
            view={view}
            contacts={filteredContacts}
            activeContact={activeContact}
            searchQuery={searchQuery}
            user={user}
            onSearchChange={setSearchQuery}
            onOpenChat={openChat}
            onAddContact={() => setView('add-contact')}
          />
        )}

        {view === 'chat' && activeContact && (
          <ChatWindow
            activeContact={activeContact}
            messages={messages}
            inputText={inputText}
            userId={user.id}
            messagesEndRef={messagesEndRef}
            onBack={() => setView('chats')}
            onInputChange={setInputText}
            onSend={sendMessage}
            onSendImage={sendImage}
          />
        )}

        {view === 'chats' && (
          <div className="flex-1 flex items-center justify-center bg-void hex-bg">
            <div className="text-center corner-box p-12 animate-fade-in-up">
              <div className="w-16 h-16 rounded border border-neon-red/30 flex items-center justify-center mx-auto mb-6 shadow-neon-red">
                <span className="font-orbitron text-neon-red text-2xl">✉</span>
              </div>
              <h2 className="font-orbitron text-white font-bold mb-2 tracking-widest">INFERNO CHAT</h2>
              <p className="text-sm font-mono text-muted-foreground">Выберите контакт для начала<br />зашифрованного сеанса</p>
              <button onClick={() => setView('add-contact')} className="mt-4 text-xs font-orbitron text-neon-red border border-neon-red/30 rounded px-4 py-2 hover:bg-neon-red/10 transition-colors">
                + ДОБАВИТЬ КОНТАКТ
              </button>
            </div>
          </div>
        )}

        {view === 'add-contact' && (
          <AddContactView
            addUsername={addUsername}
            addError={addError}
            addLoading={addLoading}
            onUsernameChange={setAddUsername}
            onAdd={addContact}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            user={user}
            editName={editName}
            editStatus={editStatus}
            profileSaving={profileSaving}
            avatarInputRef={avatarInputRef}
            onEditNameChange={setEditName}
            onEditStatusChange={setEditStatus}
            onSave={saveProfile}
            onUploadAvatar={uploadAvatar}
            onLogout={logout}
          />
        )}

        {view === 'settings' && (
          <SettingsView onLogout={logout} />
        )}
      </div>
    </div>
  );
}
