import os
import json
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Gemini Configurations
    GEMINI_API_KEY: str = Field(default="", validation_alias="GEMINI_API_KEY")
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    LLM_MODEL: str = "models/gemini-2.5-flash"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./data/chat_history.db"
    
    # JWT Configurations
    JWT_SECRET_KEY: str = "enterprise-rag-assistant-secret-key-2026-secure-default"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # RAG Settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    SIMILARITY_THRESHOLD: float = 0.75
    TOP_K: int = 3
    CHROMA_PERSIST_DIR: str = "./data/chromadb"
    
    # Rate Limiting Configurations
    RATE_LIMIT_CHAT_MAX_REQUESTS: int = 15
    RATE_LIMIT_CHAT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_UPLOAD_MAX_REQUESTS: int = 5
    RATE_LIMIT_UPLOAD_WINDOW_SECONDS: int = 60

    # API Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = '["http://localhost:5173", "http://localhost:3000"]'
    LOG_LEVEL: str = "INFO"

    # Load from .env file (try both root and backend directory paths)
    model_config = SettingsConfigDict(
        env_file=[
            ".env",
            "backend/.env",
            os.path.join(os.path.dirname(__file__), ".env")
        ],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def sqlite_db_path(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("sqlite:///"):
            return url.replace("sqlite:///", "")
        return url

    @property
    def parsed_cors_origins(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["http://localhost:5173", "http://localhost:3000"]

# Instantiate settings
settings = Settings()
