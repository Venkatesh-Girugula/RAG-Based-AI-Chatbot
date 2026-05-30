import sqlite3
import os
import logging
from contextlib import contextmanager
from backend.config import settings

logger = logging.getLogger("app.sqlite_db")

def init_db():
    db_path = settings.SQLITE_DB_PATH
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        logger.info(f"Created directory for SQLite: {db_dir}")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_id ON chat_messages(session_id)
        """)
        conn.commit()
        conn.close()
        logger.info(f"SQLite database initialized at {db_path}")
    except Exception as e:
        logger.error(f"Error initializing SQLite database: {e}")
        raise e

@contextmanager
def get_db():
    db_path = settings.SQLITE_DB_PATH
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
