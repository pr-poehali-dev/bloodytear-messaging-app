"""
Аутентификация: регистрация и вход пользователя.
POST /register — создать аккаунт
POST /login — войти в аккаунт
GET / — проверить токен
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30447770_bloodytear_messaging')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')

    conn = get_conn()
    cur = conn.cursor()

    # Проверить токен
    if method == 'GET':
        if not token:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Нет токена'}, ensure_ascii=False)}
        cur.execute(
            f"SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, u.email FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Токен недействителен'}, ensure_ascii=False)}
        user = {'id': row[0], 'username': row[1], 'display_name': row[2], 'avatar_url': row[3], 'status': row[4], 'email': row[5]}
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user}, ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    # Регистрация
    if '/register' in path or action == 'register':
        username = body.get('username', '').strip()
        email = body.get('email', '').strip()
        password = body.get('password', '')
        display_name = body.get('display_name', username).strip()

        if not username or not email or not password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все поля'}, ensure_ascii=False)}
        if len(password) < 6:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'}, ensure_ascii=False)}

        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s OR email = %s", (username, email))
        if cur.fetchone():
            return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Пользователь уже существует'}, ensure_ascii=False)}

        pwd_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (username, email, password_hash, display_name) VALUES (%s, %s, %s, %s) RETURNING id",
            (username, email, pwd_hash, display_name)
        )
        user_id = cur.fetchone()[0]

        token_val = secrets.token_hex(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token_val))

        # Взаимно добавить нового пользователя всем существующим
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE id != %s", (user_id,))
        existing_ids = [r[0] for r in cur.fetchall()]
        for eid in existing_ids:
            cur.execute(f"INSERT INTO {SCHEMA}.contacts (user_id, contact_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, eid))
            cur.execute(f"INSERT INTO {SCHEMA}.contacts (user_id, contact_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (eid, user_id))

        conn.commit()
        cur.close(); conn.close()

        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'token': token_val,
            'user': {'id': user_id, 'username': username, 'display_name': display_name, 'avatar_url': None, 'status': '// Анонимность — это свобода.', 'email': email}
        }, ensure_ascii=False)}

    # Вход
    if '/login' in path or action == 'login':
        login = body.get('login', '').strip()
        password = body.get('password', '')

        cur.execute(
            f"SELECT id, username, display_name, avatar_url, status, email FROM {SCHEMA}.users WHERE (username = %s OR email = %s) AND password_hash = %s",
            (login, login, hash_password(password))
        )
        row = cur.fetchone()
        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'}, ensure_ascii=False)}

        user_id = row[0]
        token_val = secrets.token_hex(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token_val))
        cur.execute(f"UPDATE {SCHEMA}.users SET online_status = 'online', last_seen = NOW() WHERE id = %s", (user_id,))
        conn.commit()
        cur.close(); conn.close()

        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'token': token_val,
            'user': {'id': row[0], 'username': row[1], 'display_name': row[2], 'avatar_url': row[3], 'status': row[4], 'email': row[5]}
        }, ensure_ascii=False)}

    cur.close(); conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'}, ensure_ascii=False)}