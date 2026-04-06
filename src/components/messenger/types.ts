export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  email: string;
  chat_theme?: string;
  msg_font?: string;
}

export interface Contact {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  online_status: string;
  last_message: string;
  last_time: string;
  unread: number;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string | null;
  image_url: string | null;
  msg_type: string;
  time: string;
}

export type View = 'chats' | 'chat' | 'profile' | 'settings' | 'notifications' | 'add-contact' | 'admin';
export type AuthView = 'login' | 'register';

export const CHAT_THEMES = [
  { id: 'default', name: 'INFERNO', bg: 'bg-void', accent: 'border-neon-red/30', description: 'Классика' },
  { id: 'cosmos', name: 'COSMOS', bg: 'bg-[#0a0015]', accent: 'border-purple-500/30', description: 'Глубокий космос' },
  { id: 'nebula', name: 'NEBULA', bg: 'bg-[#000d1a]', accent: 'border-cyan-500/30', description: 'Туманность' },
  { id: 'aurora', name: 'AURORA', bg: 'bg-[#001a0d]', accent: 'border-emerald-500/30', description: 'Северное сияние' },
  { id: 'supernova', name: 'SUPERNOVA', bg: 'bg-[#1a0000]', accent: 'border-orange-500/30', description: 'Сверхновая' },
  { id: 'blackhole', name: 'BLACK HOLE', bg: 'bg-black', accent: 'border-white/10', description: 'Чёрная дыра' },
] as const;

export const MSG_FONTS = [
  { id: 'default', name: 'Обычный', className: 'font-sans', preview: 'Привет!' },
  { id: 'mono', name: 'Моно', className: 'font-mono', preview: 'Привет!' },
  { id: 'orbitron', name: 'Orbitron', className: 'font-orbitron', preview: 'Привет!' },
  { id: 'rainbow', name: 'Радуга', className: 'font-sans msg-rainbow', preview: 'Привет!' },
  { id: 'glitch', name: 'Глитч', className: 'font-orbitron msg-glitch', preview: 'Привет!' },
  { id: 'neon', name: 'Неон', className: 'font-orbitron msg-neon', preview: 'Привет!' },
] as const;

export type ThemeId = typeof CHAT_THEMES[number]['id'];
export type FontId = typeof MSG_FONTS[number]['id'];
