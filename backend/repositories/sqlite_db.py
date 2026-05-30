import sqlite3
import os
import logging
import hashlib
from contextlib import contextmanager
from backend.config import settings

logger = logging.getLogger("app.sqlite_db")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    db_path = settings.SQLITE_DB_PATH
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        logger.info(f"Created directory for SQLite: {db_dir}")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Chat Messages Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                sources_json TEXT,
                total_tokens INTEGER DEFAULT 0,
                feedback_rating INTEGER,
                feedback_text TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_id ON chat_messages(session_id)
        """)
        
        # 2. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 3. Documents Registry Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS registry_documents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                size INTEGER NOT NULL,
                status TEXT NOT NULL,
                chunk_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 4. System Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level TEXT NOT NULL,
                module TEXT NOT NULL,
                message TEXT NOT NULL,
                details_json TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        
        # Seed default admin and user if users table is empty
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            admin_pwd = hash_password("admin")
            user_pwd = hash_password("ravi")
            
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ("admin", "admin@enterprise.io", admin_pwd, "admin")
            )
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
                ("ravi", "karinguravi37@gmail.com", user_pwd, "user")
            )
            conn.commit()
            logger.info("Database users table seeded with default admin and ravi credentials.")
            
        # Seed welcome system logs
        cursor.execute("SELECT COUNT(*) FROM system_logs")
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                "INSERT INTO system_logs (level, module, message) VALUES (?, ?, ?)",
                ("INFO", "DATABASE", "SQLite corporate schemas initialized and user credentials verified.")
            )
            cursor.execute(
                "INSERT INTO system_logs (level, module, message) VALUES (?, ?, ?)",
                ("INFO", "SECURITY", "Active directory role checks established: Moderator, User, and Admin.")
            )
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

def log_event(level: str, module: str, message: str, details_json: str = None):
    try:
        db_path = settings.SQLITE_DB_PATH
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO system_logs (level, module, message, details_json) VALUES (?, ?, ?, ?)",
            (level, module, message, details_json)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to write event to system_logs: {e}")
