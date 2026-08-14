import os, base64, json, time
import httpx
from jose import jwt
from app.core.config import settings
from app.core.supabase_auth import verify_supabase_jwt


def b64url_decode(input_str: str) -> bytes:
    s = input_str.encode('utf-8')
    rem = len(s) % 4
    if rem:
        s += b'=' * (4 - rem)
    return base64.urlsafe_b64decode(s)


def main():
    token = os.environ.get('TOKEN')
    if not token:
        print(json.dumps({'error': 'no token provided'}))
        return 1

    # header
    try:
        header = jwt.get_unverified_header(token)
    except Exception as e:
        header = {'error': f'header decode error: {str(e)}'}

    # payload
    try:
        parts = token.split('.')
        payload = json.loads(b64url_decode(parts[1]).decode('utf-8'))
    except Exception as e:
        payload = {'error': f'payload decode error: {str(e)}'}

    now = int(time.time())
    exp = payload.get('exp') if isinstance(payload, dict) else None
    expired = None
    if exp is not None:
        try:
            expired = int(exp) < now
        except Exception:
            expired = None

    out = {
        'alg': header.get('alg') if isinstance(header, dict) else None,
        'kid': header.get('kid') if isinstance(header, dict) else None,
        'iss': payload.get('iss') if isinstance(payload, dict) else None,
        'aud': payload.get('aud') if isinstance(payload, dict) else None,
        'exp': exp,
        'iat': payload.get('iat') if isinstance(payload, dict) else None,
        'sub': payload.get('sub') if isinstance(payload, dict) else None,
        'expired': expired,
    }
    print(json.dumps({'decoded_fields': out}, ensure_ascii=False))

    # JWKS URL the app would use
    if getattr(settings, 'supabase_jwks_url', None):
        jwks_url = settings.supabase_jwks_url.strip()
    else:
        jwks_url = settings.supabase_url.strip().rstrip('/') + '/auth/v1/.well-known/jwks.json'
    print(json.dumps({'jwks_url_used': jwks_url}))

    # fetch jwks and check kid
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(jwks_url)
            resp.raise_for_status()
            jwks = resp.json()
            keys = jwks.get('keys', [])
            kid = header.get('kid') if isinstance(header, dict) else None
            jwks_has_kid = any(k.get('kid') == kid for k in keys) if kid else False
            print(json.dumps({'jwks_has_kid': jwks_has_kid, 'jwks_key_count': len(keys)}))
    except Exception as e:
        print(json.dumps({'jwks_fetch_error': str(e)}))

    # Try calling verify_supabase_jwt and capture exception
    try:
        claims = verify_supabase_jwt(token)
        print(json.dumps({'verify_result': 'success', 'claims_sub': claims.get('sub')}))
    except Exception as e:
        print(json.dumps({'verify_error_type': type(e).__name__, 'verify_error': str(e)}))

    return 0

if __name__ == '__main__':
    raise SystemExit(main())
