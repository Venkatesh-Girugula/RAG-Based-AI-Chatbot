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
        Generates embeddings for a batch of text chunks, grouping them to avoid hitting rate limits.
        """
        self._ensure_initialized()
        
        # Filter out empty or whitespace-only chunks
        valid_indices = []
        valid_texts = []
        for idx, text in enumerate(texts):
            if text and text.strip():
                valid_indices.append(idx)
                valid_texts.append(text.strip())
        
        if not valid_texts:
            return []
            
        embeddings_map = {}
        batch_size = 10  # Moderate batch size to prevent overloading and respect token/rate limits
        
        for i in range(0, len(valid_texts), batch_size):
            batch_texts = valid_texts[i:i + batch_size]
            batch_indices = valid_indices[i:i + batch_size]
            
            max_retries = 3
            backoff_factor = 2.0
            initial_delay = 1.0
            
            success = False
            for attempt in range(1, max_retries + 1):
                try:
                    response = genai.embed_content(
                        model=settings.EMBEDDING_MODEL,
                        content=batch_texts,
                        task_type=task_type
                    )
                    
                    if "embedding" in response:
                        batch_res = response["embedding"]
                    elif hasattr(response, "embedding") and response.embedding:
                        batch_res = response.embedding
                    else:
                        raise ValueError("Failed to retrieve embedding vector from Gemini response.")
                        
                    # Map embeddings back to their original index
                    for sub_idx, emb in enumerate(batch_res):
                        orig_idx = batch_indices[sub_idx]
                        embeddings_map[orig_idx] = emb
                        
                    success = True
                    break
                    
                except GoogleAPICallError as e:
                    logger.warning(f"Google API error generating batch embedding (attempt {attempt}/{max_retries}): {e}")
                    if attempt == max_retries:
                        raise e
                    time.sleep(initial_delay * (backoff_factor ** (attempt - 1)))
                except Exception as e:
                    logger.error(f"Unexpected error generating batch embedding (attempt {attempt}/{max_retries}): {e}")
                    if attempt == max_retries:
                        raise e
                    time.sleep(initial_delay * (backoff_factor ** (attempt - 1)))
            
            if not success:
                raise RuntimeError("Batch embedding generation failed after all retries.")
                
            # Add a small delay between batches to satisfy rate limits (RPM)
            if i + batch_size < len(valid_texts):
                time.sleep(1.0)
                
        # Reconstruct the original list order, using zero vectors for filtered/empty elements if any
        embedding_dim = 768  # gemini-embedding-001 dimension
        result = []
        for idx in range(len(texts)):
            if idx in embeddings_map:
                result.append(embeddings_map[idx])
            else:
                # Fallback for empty text elements
                result.append([0.0] * embedding_dim)
                
        return result

embedding_service = EmbeddingService()
