"""
Профиль пользователя: обновление данных и загрузка аватара.
PUT / — обновить display_name, status
POST /avatar — загрузить фото (base64)
GET /users — получить список всех пользователей (для добавления контактов)
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_from_token(cur, token):
    cur.execute(
        f"SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, u.email FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'id': row[0], 'username': row[1], 'display_name': row[2], 'avatar_url': row[3], 'status': row[4], 'email': row[5]}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')

    conn = get_conn()
    cur = conn.cursor()

    # Список пользователей (без авторизации для поиска контактов)
    query_params = event.get('queryStringParameters') or {}
    if query_params.get('action') == 'users' and method == 'GET':
        search = query_params.get('search', '').strip()
        if search:
            cur.execute(
                f"SELECT id, username, display_name, avatar_url, online_status FROM {SCHEMA}.users WHERE username ILIKE %s OR display_name ILIKE %s LIMIT 20",
                (f'%{search}%', f'%{search}%')
            )
        else:
            cur.execute(f"SELECT id, username, display_name, avatar_url, online_status FROM {SCHEMA}.users LIMIT 50")
        rows = cur.fetchall()
        users = [{'id': r[0], 'username': r[1], 'display_name': r[2], 'avatar_url': r[3], 'online_status': r[4]} for r in rows]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'users': users}, ensure_ascii=False)}

    if not token:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'}, ensure_ascii=False)}

    user = get_user_from_token(cur, token)
    if not user:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Токен недействителен'}, ensure_ascii=False)}

    body_raw = event.get('body') or '{}'
    body = json.loads(body_raw)
    action = body.get('action', '')

    # Загрузка аватара
    if (action == 'avatar' or '/avatar' in path) and method == 'POST':
        image_data = body.get('image', '')

        if not image_data:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нет изображения'}, ensure_ascii=False)}

        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)
        ext = body.get('ext', 'jpg').lower()
        key = f"avatars/{user['id']}_{secrets.token_hex(8)}.{ext}"

        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        content_type = f"image/{ext}" if ext != 'jpg' else 'image/jpeg'
        s3.put_object(Bucket='files', Key=key, Body=image_bytes, ContentType=content_type)

        avatar_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"

        cur.execute(f"UPDATE {SCHEMA}.users SET avatar_url = %s WHERE id = %s", (avatar_url, user['id']))
        conn.commit()
        cur.close(); conn.close()

        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'avatar_url': avatar_url}, ensure_ascii=False)}

    # Обновление профиля
    if method == 'PUT':
        display_name = body.get('display_name', user['display_name'])
        status = body.get('status', user['status'])

        cur.execute(
            f"UPDATE {SCHEMA}.users SET display_name = %s, status = %s WHERE id = %s",
            (display_name, status, user['id'])
        )
        conn.commit()

        updated = {**user, 'display_name': display_name, 'status': status}
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': updated}, ensure_ascii=False)}

    cur.close(); conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'}, ensure_ascii=False)}