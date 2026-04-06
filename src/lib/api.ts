const URLS = {
  auth: 'https://functions.poehali.dev/b465a972-473d-47c6-afea-07d4a5579359',
  profile: 'https://functions.poehali.dev/0b449202-dd89-400e-925e-9ad2e51d18a3',
  messages: 'https://functions.poehali.dev/b1bbbc38-0d0c-4bb6-893a-4ea3c76ae9db',
  admin: 'https://functions.poehali.dev/bb9aaf8c-56ad-40f5-a058-8819aa0f2927',
};

function getToken(): string {
  return localStorage.getItem('inferno_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Authorization': `Bearer ${getToken()}`,
  };
}

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Token': localStorage.getItem('inferno_admin_token') || '',
  };
}

export const api = {
  // AUTH
  async checkToken() {
    const r = await fetch(URLS.auth, { headers: authHeaders() });
    return r.json();
  },
  async register(data: { username: string; email: string; password: string; display_name: string }) {
    const r = await fetch(URLS.auth, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'register', ...data }),
    });
    return r.json();
  },
  async login(data: { login: string; password: string }) {
    const r = await fetch(URLS.auth, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'login', ...data }),
    });
    return r.json();
  },

  // PROFILE
  async updateProfile(data: { display_name?: string; status?: string; chat_theme?: string; msg_font?: string }) {
    const r = await fetch(URLS.profile, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return r.json();
  },
  async uploadAvatar(image: string, ext: string) {
    const r = await fetch(URLS.profile, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'avatar', image, ext }),
    });
    return r.json();
  },
  async searchUsers(search: string) {
    const r = await fetch(`${URLS.profile}?action=users&search=${encodeURIComponent(search)}`, {
      headers: authHeaders(),
    });
    return r.json();
  },

  // MESSAGES
  async getContacts() {
    const r = await fetch(`${URLS.messages}?action=contacts`, {
      headers: authHeaders(),
    });
    return r.json();
  },
  async addContact(username: string) {
    const r = await fetch(`${URLS.messages}?action=contacts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username }),
    });
    return r.json();
  },
  async getMessages(withId: number) {
    const r = await fetch(`${URLS.messages}?with=${withId}`, {
      headers: authHeaders(),
    });
    return r.json();
  },
  async sendMessage(data: { receiver_id: number; text?: string; image?: string; ext?: string }) {
    const r = await fetch(URLS.messages, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return r.json();
  },
  async markRead(sender_id: number) {
    const r = await fetch(`${URLS.messages}?action=read`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ sender_id }),
    });
    return r.json();
  },
  async deleteChat(withId: number) {
    const r = await fetch(`${URLS.messages}?with=${withId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return r.json();
  },

  // ADMIN
  async adminLogin(password: string) {
    const r = await fetch(`${URLS.admin}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return r.json();
  },
  async adminGetUsers() {
    const r = await fetch(`${URLS.admin}?action=users`, { headers: adminHeaders() });
    return r.json();
  },
  async adminGetMessages(userA: number, userB: number) {
    const r = await fetch(`${URLS.admin}?action=messages&user_a=${userA}&user_b=${userB}`, { headers: adminHeaders() });
    return r.json();
  },
  async adminDeleteUser(id: number) {
    const r = await fetch(`${URLS.admin}?action=user&id=${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    return r.json();
  },
  async adminEditUser(data: { id: number; display_name?: string; status?: string }) {
    const r = await fetch(`${URLS.admin}?action=user`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    return r.json();
  },
};
