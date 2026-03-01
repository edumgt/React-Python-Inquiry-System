from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    project_name: str = 'Inland Freight Inquiry System'
    api_v1_prefix: str = '/api'

    secret_key: str = Field(default='replace-this-secret-key')
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60 * 8

    database_url: str = 'postgresql+psycopg://inquiry:inquiry@db:5432/inquiry'

    cors_origins: list[str] = ['http://localhost:5173', 'http://localhost:9000']


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
