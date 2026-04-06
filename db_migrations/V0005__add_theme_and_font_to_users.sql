ALTER TABLE t_p30447770_bloodytear_messaging.users
  ADD COLUMN IF NOT EXISTS chat_theme VARCHAR(50) DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS msg_font VARCHAR(50) DEFAULT 'default';