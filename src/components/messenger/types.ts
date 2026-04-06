export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  email: string;
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

export type View = 'chats' | 'chat' | 'profile' | 'settings' | 'notifications' | 'add-contact';
export type AuthView = 'login' | 'register';
