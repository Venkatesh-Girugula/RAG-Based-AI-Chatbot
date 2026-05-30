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
    SECRET_KEY: str = "enterprise-rag-assistant-secret-key-2026-secure-default"

    # RAG Settings
    SIMILARITY_THRESHOLD: float = 0.75
    TOP_K: int = 3
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    CHROMA_PERSIST_DIR: str = "./data/chromadb"

    # Database Settings
    SQLITE_DB_PATH: str = "./data/chat_history.db"

    # API Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = '["http://localhost:5173", "http://localhost:3000"]'
    LOG_LEVEL: str = "INFO"

    # Load from .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def parsed_cors_origins(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["http://localhost:5173", "http://localhost:3000"]

# Instantiate settings
settings = Settings()
