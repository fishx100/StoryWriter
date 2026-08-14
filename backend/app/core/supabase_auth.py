from typing import Any, Dict, Optional
import time

from jose import jwt, JWTError
import httpx

from fastapi import HTTPException

from app.core.config import settings

# Simple in-memory cache for JWKS
_JWKS_CACHE: Optional[Dict[str, Any]] = None
_JWKS_CACHE_AT: float = 0.0
_JWKS_TTL = 600  # seconds


def _get_jwks_url() -> str:
    if getattr(settings, 'supabase_jwks_url', None):
        return settings.supabase_jwks_url.strip()
    if not getattr(settings, 'supabase_url', None):
        raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")
    url = settings.supabase_url.strip().rstrip('/')
    return f"{url}/auth/v1/.well-known/jwks.json"


def _fetch_jwks() -> Dict[str, Any]:
    global _JWKS_CACHE, _JWKS_CACHE_AT
    now = time.time()
    if _JWKS_CACHE and (now - _JWKS_CACHE_AT) < _JWKS_TTL:
        return _JWKS_CACHE

    jwks_url = _get_jwks_url()
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(jwks_url)
            resp.raise_for_status()
            jwks = resp.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail="Unable to retrieve JWKS")

    _JWKS_CACHE = jwks
    _JWKS_CACHE_AT = now
    return jwks


def _get_signing_key(token_kid: str) -> Dict[str, Any]:
    jwks = _fetch_jwks()
    keys = jwks.get('keys', [])
    for key in keys:
        if key.get('kid') == token_kid:
            return key
    raise HTTPException(status_code=401, detail="Unknown signing key")


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """Verify a Supabase JWT using the project's JWKS.

    Returns the token claims on success or raises HTTPException(401) on failure.
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token header")

    kid = unverified_header.get('kid')
    if not kid:
        raise HTTPException(status_code=401, detail="Missing kid in token header")

    # Build issuer and audience expectations
    if not getattr(settings, 'supabase_url', None):
        raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")
    issuer = settings.supabase_url.strip().rstrip('/') + '/auth/v1'
    audience = 'authenticated'

    # Check JWKS presence for diagnostics
    try:
        jwk = _get_signing_key(kid)
        jwks_has_kid = True
    except HTTPException:
        jwk = None
        jwks_has_kid = False

    # No debug printing in production code.

    # If jwk not found, raise early
    if not jwk:
        raise HTTPException(status_code=401, detail="Unknown signing key")

    try:
        # Determine algorithm from token header if possible
        alg = unverified_header.get('alg')
        if not alg:
            raise HTTPException(status_code=401, detail="Missing alg in token header")

        # python-jose accepts the jwk dict directly as key
        claims = jwt.decode(
            token,
            jwk,
            algorithms=[alg],
            issuer=issuer,
            audience=audience,
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return claims
