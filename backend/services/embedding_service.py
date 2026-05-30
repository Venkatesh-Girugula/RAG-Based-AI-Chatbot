import time
import logging
from typing import List
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPICallError
from backend.config import settings

logger = logging.getLogger("app.embedding_service")

class EmbeddingService:
    def __init__(self):
        self._initialized = False

    def _ensure_initialized(self):
        if not self._initialized:
            if not settings.GEMINI_API_KEY:
                logger.warning("GEMINI_API_KEY environment variable is not set. Gemini API calls will fail.")
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._initialized = True

    def get_embedding(self, text: str, task_type: str = "retrieval_document") -> List[float]:
        """
        Generates embedding for a single text chunk with retry logic and timeout.
        """
        self._ensure_initialized()
        
        if not text or not text.strip():
            raise ValueError("Text for embedding generation cannot be empty.")

        max_retries = 3
        backoff_factor = 2.0
        initial_delay = 1.0

        for attempt in range(1, max_retries + 1):
            try:
                # Call embedding API
                response = genai.embed_content(
                    model=settings.EMBEDDING_MODEL,
                    content=text,
                    task_type=task_type
                )
                
                if "embedding" in response:
                    return response["embedding"]
                elif hasattr(response, "embedding") and response.embedding:
                    # Depending on library version returned object structure
                    return response.embedding
                else:
                    raise ValueError("Failed to retrieve embedding vector from Gemini response.")

            except GoogleAPICallError as e:
                logger.warning(f"Google API error generating embedding (attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    raise e
                time.sleep(initial_delay * (backoff_factor ** (attempt - 1)))
            except Exception as e:
                logger.error(f"Unexpected error generating embedding (attempt {attempt}/{max_retries}): {e}")
                if attempt == max_retries:
                    raise e
                time.sleep(initial_delay * (backoff_factor ** (attempt - 1)))

        raise RuntimeError("Embedding generation failed after all retries.")

    def get_embeddings(self, texts: List[str], task_type: str = "retrieval_document") -> List[List[float]]:
        """
        Generates embeddings for a batch of text chunks.
        """
        embeddings = []
        for i, text in enumerate(texts):
            try:
                emb = self.get_embedding(text, task_type=task_type)
                embeddings.append(emb)
            except Exception as e:
                logger.error(f"Error generating embedding for chunk {i}: {e}")
                raise e
        return embeddings

embedding_service = EmbeddingService()
