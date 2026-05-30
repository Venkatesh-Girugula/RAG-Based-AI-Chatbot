import logging
from typing import List, Dict, Any
from backend.repositories.sqlite_db import get_db

logger = logging.getLogger("app.memory_service")

class MemoryService:
    def add_message(self, session_id: str, role: str, content: str) -> None:
        """
        Adds a message (user or assistant) to the database and trims the session
        to store only the last 5 exchanges (last 10 messages).
        """
        if not session_id or not session_id.strip():
            raise ValueError("Session ID cannot be empty.")
        if role not in ["user", "assistant"]:
            raise ValueError("Role must be either 'user' or 'assistant'.")
        if not content or not content.strip():
            raise ValueError("Message content cannot be empty.")

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                # Insert the new message
                cursor.execute(
                    "INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)",
                    (session_id, role, content)
                )
                conn.commit()
                
                # Trim messages to retain only the latest 10 messages (5 exchanges)
                cursor.execute(
                    "SELECT id FROM chat_messages WHERE session_id = ? ORDER BY timestamp DESC, id DESC",
                    (session_id,)
                )
                rows = cursor.fetchall()
                
                # If we have more than 10 messages, delete the older ones
                if len(rows) > 10:
                    cutoff_id = rows[9]["id"] # The 10th newest message's ID (0-indexed 9)
                    cursor.execute(
                        "DELETE FROM chat_messages WHERE session_id = ? AND id < ?",
                        (session_id, cutoff_id)
                    )
                    conn.commit()
                    logger.debug(f"Trimmed conversation history for session {session_id} to last 10 messages.")
        except Exception as e:
            logger.error(f"Failed to add message to session {session_id}: {e}")
            raise e

    def get_messages(self, session_id: str) -> List[Dict[str, str]]:
        """
        Retrieves the latest 10 messages (5 exchanges) for a session,
        sorted chronologically.
        """
        if not session_id or not session_id.strip():
            raise ValueError("Session ID cannot be empty.")

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC, id ASC",
                    (session_id,)
                )
                rows = cursor.fetchall()
                messages = [{"role": row["role"], "content": row["content"]} for row in rows]
                
                # Double-check that we are returning at most 10 messages (just in case)
                if len(messages) > 10:
                    messages = messages[-10:]
                
                return messages
        except Exception as e:
            logger.error(f"Failed to retrieve messages for session {session_id}: {e}")
            raise e

    def clear_session(self, session_id: str) -> None:
        """
        Deletes all messages associated with a session ID.
        """
        if not session_id or not session_id.strip():
            raise ValueError("Session ID cannot be empty.")

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
                conn.commit()
                logger.info(f"Cleared session history for {session_id}")
        except Exception as e:
            logger.error(f"Failed to clear session {session_id}: {e}")
            raise e

memory_service = MemoryService()
