"""
Сообщения и контакты мессенджера.
GET /contacts — список контактов с последним сообщением
POST /contacts — добавить контакт по username
GET /?with=USER_ID — получить историю с пользователем
POST / — отправить сообщение (text или image base64)
PUT /read — отметить прочитанными
DELETE / — удалить переписку с пользователем
"""
import json
import os
import base64
import secrets
import psycopg2
import boto3

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30447770_bloodytear_messaging')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_id(cur, token):
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')

    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'}, ensure_ascii=False)}

    conn = get_conn()
    cur = conn.cursor()

    user_id = get_user_id(cur, token)
    if not user_id:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Токен недействителен'}, ensure_ascii=False)}

    # Список контактов с последним сообщением и количеством непрочитанных
    if (action == 'contacts' or '/contacts' in path) and method == 'GET':
        uid = user_id
        cur.execute(f"""
            SELECT 
                u.id, u.username, u.display_name, u.avatar_url, u.online_status,
                (SELECT text FROM {SCHEMA}.messages m 
                 WHERE (m.sender_id = %s AND m.receiver_id = u.id) OR (m.sender_id = u.id AND m.receiver_id = %s)
                 ORDER BY m.created_at DESC LIMIT 1) as last_text,
                (SELECT image_url FROM {SCHEMA}.messages m 
                 WHERE (m.sender_id = %s AND m.receiver_id = u.id) OR (m.sender_id = u.id AND m.receiver_id = %s)
                 ORDER BY m.created_at DESC LIMIT 1) as last_image,
                (SELECT created_at FROM {SCHEMA}.messages m 
                 WHERE (m.sender_id = %s AND m.receiver_id = u.id) OR (m.sender_id = u.id AND m.receiver_id = %s)
                 ORDER BY m.created_at DESC LIMIT 1) as last_time,
                (SELECT COUNT(*) FROM {SCHEMA}.messages m 
                 WHERE m.sender_id = u.id AND m.receiver_id = %s AND m.is_read = FALSE) as unread
            FROM {SCHEMA}.contacts c
            JOIN {SCHEMA}.users u ON u.id = c.contact_id
            WHERE c.user_id = %s
            ORDER BY last_time DESC NULLS LAST
        """, (uid, uid, uid, uid, uid, uid, uid, uid))
        rows = cur.fetchall()
        contacts = []
        for r in rows:
            last_msg = r[5] or ('[фото]' if r[6] else '...')
            last_time_str = r[7].strftime('%H:%M') if r[7] else ''
            contacts.append({
                'id': r[0], 'username': r[1], 'display_name': r[2],
                'avatar_url': r[3], 'online_status': r[4],
                'last_message': last_msg, 'last_time': last_time_str,
                'unread': int(r[8])
            })
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'contacts': contacts}, ensure_ascii=False)}

    # Добавить контакт
    if (action == 'contacts' or '/contacts' in path) and method == 'POST':
        body = json.loads(event.get('body') or '{}')
        username = body.get('username', '').strip()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s", (username,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Пользователь не найден'}, ensure_ascii=False)}
        contact_id = row[0]
        if contact_id == user_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нельзя добавить себя'}, ensure_ascii=False)}
        cur.execute(
            f"INSERT INTO {SCHEMA}.contacts (user_id, contact_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (user_id, contact_id)
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True}, ensure_ascii=False)}

    # Отметить прочитанными
    if (action == 'read' or '/read' in path) and method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        sender_id = body.get('sender_id')
        cur.execute(
            f"UPDATE {SCHEMA}.messages SET is_read = TRUE WHERE sender_id = %s AND receiver_id = %s",
            (sender_id, user_id)
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True}, ensure_ascii=False)}

    # Удалить переписку с пользователем
    if method == 'DELETE':
        with_id = query_params.get('with')
        if not with_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен параметр with'}, ensure_ascii=False)}
        cur.execute(f"""
            DELETE FROM {SCHEMA}.messages
            WHERE (sender_id = %s AND receiver_id = %s) OR (sender_id = %s AND receiver_id = %s)
        """, (user_id, int(with_id), int(with_id), user_id))
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True}, ensure_ascii=False)}

    # История сообщений
    if method == 'GET':
        with_id = query_params.get('with')
        if not with_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен параметр with'}, ensure_ascii=False)}
        cur.execute(f"""
            SELECT id, sender_id, receiver_id, text, image_url, msg_type, is_read, created_at
            FROM {SCHEMA}.messages
            WHERE (sender_id = %s AND receiver_id = %s) OR (sender_id = %s AND receiver_id = %s)
            ORDER BY created_at ASC LIMIT 100
        """, (user_id, int(with_id), int(with_id), user_id))
        rows = cur.fetchall()
        msgs = [{
            'id': r[0], 'sender_id': r[1], 'receiver_id': r[2],
            'text': r[3], 'image_url': r[4], 'msg_type': r[5],
            'is_read': r[6], 'time': r[7].strftime('%H:%M')
        } for r in rows]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'messages': msgs}, ensure_ascii=False)}

    # Отправить сообщение
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        receiver_id = body.get('receiver_id')
        text = body.get('text', '').strip()
        image_data = body.get('image', '')
        msg_type = 'text'
        image_url = None

        if image_data:
            msg_type = 'image'
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            ext = body.get('ext', 'jpg')
            key = f"chat_images/{user_id}_{secrets.token_hex(8)}.{ext}"
            s3 = boto3.client(
                's3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            s3.put_object(Bucket='files', Key=key, Body=image_bytes, ContentType=f'image/{ext}')
            image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"

        if not text and not image_url:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пустое сообщение'}, ensure_ascii=False)}

        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (sender_id, receiver_id, text, image_url, msg_type) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at",
            (user_id, receiver_id, text or None, image_url, msg_type)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()

        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'message': {
                'id': row[0], 'sender_id': user_id, 'receiver_id': receiver_id,
                'text': text or None, 'image_url': image_url, 'msg_type': msg_type,
                'time': row[1].strftime('%H:%M')
            }
        }, ensure_ascii=False)}

    cur.close(); conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'}, ensure_ascii=False)}
