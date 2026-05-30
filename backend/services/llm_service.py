import logging
from typing import List, Dict, Any, Tuple
import google.generativeai as genai
from backend.config import settings

logger = logging.getLogger("app.llm_service")

class LLMService:
    def __init__(self):
        self._initialized = False

    def _ensure_initialized(self):
        if not self._initialized:
            if not settings.GEMINI_API_KEY:
                logger.warning("GEMINI_API_KEY environment variable is not set. Gemini API calls will fail.")
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._initialized = True

    def generate_response(
        self, 
        query: str, 
        context: str, 
        history: List[Dict[str, str]]
    ) -> Tuple[str, int]:
        """
        Formats the system prompt with context, history, and query.
        Invokes the Gemini model to generate a strictly grounded response, and tracks token usage.
        """
        self._ensure_initialized()

        # Step 1: Format conversation history into plain text
        history_formatted = ""
        if history:
            history_parts = []
            for msg in history:
                role_label = "User" if msg["role"] == "user" else "Assistant"
                history_parts.append(f"{role_label}: {msg['content']}")
            history_formatted = "\n".join(history_parts)
        else:
            history_formatted = "No prior exchanges."

        # Step 2: Build the grounded prompt enforcing zero hallucinations
        system_prompt = (
            "You are a grounded assistant.\n"
            "Use ONLY the retrieved context provided below to answer the user's question.\n"
            "Never invent information. Do not extrapolate, assume, or reference outside facts.\n"
            "If the answer is unavailable in the retrieved context, clearly state that you do not know.\n"
            "Ensure the answer is professional, thorough, and highly accurate based on the context."
        )

        prompt = f"""SYSTEM:
{system_prompt}

CONTEXT:
{context}

CHAT HISTORY:
{history_formatted}

USER QUESTION: {query}
"""

        try:
            logger.info("Invoking Gemini LLM with context-infused prompt.")
            model = genai.GenerativeModel(settings.LLM_MODEL)
            
            # Call generation
            response = model.generate_content(prompt)
            
            reply = response.text
            if not reply:
                raise ValueError("Received an empty response from the Gemini API.")

            # Trace token usage if metadata is available
            tokens_used = 0
            try:
                if hasattr(response, "usage_metadata") and response.usage_metadata:
                    tokens_used = response.usage_metadata.total_token_count
                    logger.info(f"Gemini LLM response generated successfully. Tokens used: {tokens_used}")
                else:
                    # Fallback estimate (approx 4 chars per token)
                    tokens_used = len(prompt) // 4 + len(reply) // 4
                    logger.info(f"Tokens usage metadata unavailable. Estimated tokens: {tokens_used}")
            except Exception as metadata_err:
                logger.warning(f"Could not parse token usage metadata: {metadata_err}")
                tokens_used = len(prompt) // 4 + len(reply) // 4

            return reply, tokens_used

        except Exception as e:
            logger.error(f"Gemini LLM generation failure: {e}")
            raise e

    def generate_response_stream(
        self, 
        query: str, 
        context: str, 
        history: List[Dict[str, str]]
    ):
        """
        Generates word-by-word streaming responses using Gemini stream=True.
        Yields text chunks.
        """
        self._ensure_initialized()

        # Format prior chat history
        history_formatted = ""
        if history:
            history_parts = []
            for msg in history:
                role_label = "User" if msg["role"] == "user" else "Assistant"
                history_parts.append(f"{role_label}: {msg['content']}")
            history_formatted = "\n".join(history_parts)
        else:
            history_formatted = "No prior exchanges."

        system_prompt = (
            "You are a grounded assistant.\n"
            "Use ONLY the retrieved context provided below to answer the user's question.\n"
            "Never invent information. Do not extrapolate, assume, or reference outside facts.\n"
            "If the answer is unavailable in the retrieved context, clearly state that you do not know.\n"
            "Ensure the answer is professional, thorough, and highly accurate based on the context."
        )

        prompt = f"""SYSTEM:
{system_prompt}

CONTEXT:
{context}

CHAT HISTORY:
{history_formatted}

USER QUESTION: {query}
"""

        try:
            logger.info("Invoking streaming Gemini LLM with context-infused prompt.")
            model = genai.GenerativeModel(settings.LLM_MODEL)
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Gemini LLM streaming generation failure: {e}")
            raise e

llm_service = LLMService()
