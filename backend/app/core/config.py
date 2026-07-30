from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    database_url: str = 'sqlite:///./storywriter.db'
    secret_key: str = 'change-me'
    frontend_origin: str = 'http://localhost:3000'


settings = Settings()
