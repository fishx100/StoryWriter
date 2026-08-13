from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    database_url: str = 'sqlite:///./storywriter.db'
    secret_key: str = 'change-me'
    frontend_origin: str = 'http://localhost:3000'

    supabase_url: Optional[str] = None
    supabase_jwks_url: Optional[str] = None


settings = Settings()
