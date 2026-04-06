"""
Админ-панель. Доступ по паролю.
POST /login — вход (пароль 1226)
GET /users — список всех пользователей
GET /messages?user_a=ID&user_b=ID — переписка между двумя
DELETE /user?id=ID — удалить аккаунт
PUT /user — редактировать пользователя (display_name, status)
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30447770_bloodytear_messaging')
ADMIN_PASSWORD = '1226'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    admin_token = event.get('headers', {}).get('X-Admin-Token', '')

    # Логин — не требует токена
    if method == 'POST' and action == 'login':
        body = json.loads(event.get('body') or '{}')
        if body.get('password') == ADMIN_PASSWORD:
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'token': 'inferno_admin_1226'}, ensure_ascii=False)}
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный пароль'}, ensure_ascii=False)}

    # Все остальные маршруты — проверка токена
    if admin_token != 'inferno_admin_1226':
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'}, ensure_ascii=False)}

    conn = get_conn()
    cur = conn.cursor()

    # Список всех пользователей
    if method == 'GET' and action == 'users':
        cur.execute(f"SELECT id, username, display_name, avatar_url, email, status, online_status, created_at FROM {SCHEMA}.users ORDER BY created_at DESC")
        rows = cur.fetchall()
        users = [{'id': r[0], 'username': r[1], 'display_name': r[2], 'avatar_url': r[3], 'email': r[4], 'status': r[5], 'online_status': r[6], 'created_at': r[7].isoformat()} for r in rows]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'users': users}, ensure_ascii=False)}

    # Переписка между двумя пользователями
    if method == 'GET' and action == 'messages':
        user_a = query_params.get('user_a')
        user_b = query_params.get('user_b')
        if not user_a or not user_b:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужны user_a и user_b'}, ensure_ascii=False)}
        cur.execute(f"""
            SELECT m.id, m.sender_id, m.receiver_id, m.text, m.image_url, m.msg_type, m.is_read, m.created_at,
                   us.username as sender_name, ur.username as receiver_name
            FROM {SCHEMA}.messages m
            JOIN {SCHEMA}.users us ON us.id = m.sender_id
            JOIN {SCHEMA}.users ur ON ur.id = m.receiver_id
            WHERE (m.sender_id = %s AND m.receiver_id = %s) OR (m.sender_id = %s AND m.receiver_id = %s)
            ORDER BY m.created_at ASC LIMIT 200
        """, (int(user_a), int(user_b), int(user_b), int(user_a)))
        rows = cur.fetchall()
        msgs = [{'id': r[0], 'sender_id': r[1], 'receiver_id': r[2], 'text': r[3], 'image_url': r[4], 'msg_type': r[5], 'is_read': r[6], 'time': r[7].strftime('%H:%M %d.%m'), 'sender_name': r[8], 'receiver_name': r[9]} for r in rows]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'messages': msgs}, ensure_ascii=False)}

    # Удалить пользователя
    if method == 'DELETE' and action == 'user':
        uid = query_params.get('id')
        if not uid:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id'}, ensure_ascii=False)}
        uid = int(uid)
        cur.execute(f"DELETE FROM {SCHEMA}.messages WHERE sender_id = %s OR receiver_id = %s", (uid, uid))
        cur.execute(f"DELETE FROM {SCHEMA}.contacts WHERE user_id = %s OR contact_id = %s", (uid, uid))
        cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE user_id = %s", (uid,))
        cur.execute(f"DELETE FROM {SCHEMA}.users WHERE id = %s", (uid,))
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True}, ensure_ascii=False)}

    # Редактировать пользователя
    if method == 'PUT' and action == 'user':
        body = json.loads(event.get('body') or '{}')
        uid = body.get('id')
        display_name = body.get('display_name')
        status = body.get('status')
        if not uid:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id'}, ensure_ascii=False)}
        cur.execute(
            f"UPDATE {SCHEMA}.users SET display_name = COALESCE(%s, display_name), status = COALESCE(%s, status) WHERE id = %s",
            (display_name, status, int(uid))
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True}, ensure_ascii=False)}

    cur.close(); conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'}, ensure_ascii=False)}
