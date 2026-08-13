import time
import pytest
from fastapi.testclient import TestClient
from jose import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

from fastapi import FastAPI, Depends
from app.core import supabase_auth
from app.core.config import settings
from fastapi import Request, HTTPException


app = FastAPI()


def _depend_authorize(authorization: str = None):
    # placeholder; real dependency will be provided via TestClient requests
    return None


@app.get('/auth/me')
def _me_endpoint(request: Request):
    auth = request.headers.get('authorization')
    if not auth:
        raise HTTPException(status_code=401)
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401)
    token = parts[1]
    try:
        claims = supabase_auth.verify_supabase_jwt(token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401)

    return {'supabase_user_id': claims.get('sub'), 'email': claims.get('email')}

client = TestClient(app)


def generate_rsa_keypair():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    pub_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    return priv_pem, pub_pem


@pytest.fixture(autouse=True)
def reset_jwks_cache():
    # Ensure JWKS cache is cleared between tests
    supabase_auth._JWKS_CACHE = None
    supabase_auth._JWKS_CACHE_AT = 0.0
    yield
    supabase_auth._JWKS_CACHE = None
    supabase_auth._JWKS_CACHE_AT = 0.0


def make_token(priv_pem, kid, issuer, audience, sub, email=None, exp=None):
    now = int(time.time())
    payload = {
        'iss': issuer,
        'aud': audience,
        'sub': sub,
        'iat': now,
        'exp': exp or (now + 3600),
    }
    if email:
        payload['email'] = email
    headers = {'kid': kid}
    token = jwt.encode(payload, priv_pem, algorithm='RS256', headers=headers)
    return token


def test_no_authorization_header():
    r = client.get('/auth/me')
    assert r.status_code == 401


def test_malformed_bearer():
    r = client.get('/auth/me', headers={'Authorization': 'BadFormat token'})
    assert r.status_code == 401


def test_invalid_jwt(monkeypatch):
    priv, pub = generate_rsa_keypair()
    # Provide a signing key that won't match token kid lookup
    def fake_get_signing_key(kid):
        return pub

    monkeypatch.setattr(supabase_auth, '_get_signing_key', fake_get_signing_key)
    # token signed with different key
    other_priv, other_pub = generate_rsa_keypair()
    token = make_token(other_priv, 'kid1', settings.supabase_url.rstrip('/') + '/auth/v1', 'authenticated', 'user-id')
    r = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 401


def test_expired_jwt(monkeypatch):
    priv, pub = generate_rsa_keypair()
    monkeypatch.setattr(supabase_auth, '_get_signing_key', lambda kid: pub)
    token = make_token(priv, 'kid1', settings.supabase_url.rstrip('/') + '/auth/v1', 'authenticated', 'user-id', exp=int(time.time()) - 10)
    r = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 401


def test_wrong_issuer(monkeypatch):
    priv, pub = generate_rsa_keypair()
    monkeypatch.setattr(supabase_auth, '_get_signing_key', lambda kid: pub)
    token = make_token(priv, 'kid1', 'https://evil.example.com/auth/v1', 'authenticated', 'user-id')
    r = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 401


def test_wrong_audience(monkeypatch):
    priv, pub = generate_rsa_keypair()
    monkeypatch.setattr(supabase_auth, '_get_signing_key', lambda kid: pub)
    token = make_token(priv, 'kid1', settings.supabase_url.rstrip('/') + '/auth/v1', 'not-authenticated', 'user-id')
    r = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 401


def test_valid_jwt(monkeypatch):
    priv, pub = generate_rsa_keypair()
    monkeypatch.setattr(supabase_auth, '_get_signing_key', lambda kid: pub)
    issuer = settings.supabase_url.rstrip('/') + '/auth/v1'
    token = make_token(priv, 'kid1', issuer, 'authenticated', 'user-123', email='a@b.com')
    r = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 200
    data = r.json()
    assert data['supabase_user_id'] == 'user-123'
    assert data['email'] == 'a@b.com'


def test_unknown_kid(monkeypatch):
    priv, pub = generate_rsa_keypair()

    def raise_unknown(kid):
        raise Exception('Unknown')

    monkeypatch.setattr(supabase_auth, '_get_signing_key', raise_unknown)
    token = make_token(priv, 'kid-unknown', settings.supabase_url.rstrip('/') + '/auth/v1', 'authenticated', 'user-x')
    r = client.get('/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r.status_code == 401


def test_jwks_caching(monkeypatch):
    # Test that _fetch_jwks returns cached value when present
    supabase_auth._JWKS_CACHE = {'keys': [{'kid': 'k1'}]}
    supabase_auth._JWKS_CACHE_AT = time.time()
    jwks = supabase_auth._fetch_jwks()
    assert jwks == {'keys': [{'kid': 'k1'}]}
