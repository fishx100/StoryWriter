import time
import httpx
from jose import jwt


API = 'http://127.0.0.1:8001/api/auth/me'
PRIV_KEY_PATH = 'backend/tests/private_key.pem'
JWKS_KID = 'test-kid'


def request_no_auth():
    with httpx.Client() as c:
        r = c.get(API, timeout=10.0)
        print('NO-AUTH', r.status_code, r.text)


def request_with_token():
    with open(PRIV_KEY_PATH, 'r', encoding='utf-8') as f:
        priv = f.read()

    now = int(time.time())
    # issuer must match the server's settings.SUPABASE_URL + '/auth/v1'
    # Adjust if your server uses a different SUPABASE_URL in its environment
    issuer = 'https://rjgqvxfbnxfkhfiuhtec.supabase.co/auth/v1'
    payload = {
        'iss': issuer,
        'aud': 'authenticated',
        'sub': 'integ-user-1',
        'iat': now,
        'exp': now + 3600,
        'email': 'integ@example.test',
    }
    headers = {'kid': JWKS_KID}
    token = jwt.encode(payload, priv, algorithm='RS256', headers=headers)

    with httpx.Client() as c:
        r = c.get(API, headers={'Authorization': f'Bearer {token}'}, timeout=10.0)
        print('WITH-AUTH', r.status_code, r.text)


if __name__ == '__main__':
    request_no_auth()
    request_with_token()
