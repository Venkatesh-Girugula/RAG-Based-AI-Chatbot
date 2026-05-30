import os
import time
import logging
import json
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from backend.config import settings
from backend.models.schemas import ChatRequest, ChatResponse, HealthResponse
from backend.repositories.sqlite_db import init_db
from backend.services.memory_service import memory_service
from backend.services.rag_service import rag_service
from backend.services.llm_service import llm_service
from backend.vectorstore.vector_store import vector_store

# Configure Structured Logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("app.main")

app = FastAPI(
    title="GenAI RAG Assistant Backend",
    version="1.0.0",
    description="Production-Grade Grounded AI Chat Assistant utilizing FastAPI, ChromaDB, SQLite, and Gemini API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initialize databases and vector store seeding
@app.on_event("startup")
def on_startup():
    logger.info("Initializing relational and vector databases...")
    try:
        # Initialize SQLite database
        init_db()
        
        # Initialize ChromaDB and seed docs
        docs_json_path = os.path.join(os.path.dirname(__file__), "data", "docs.json")
        vector_store.seed_documents(docs_json_path)
        
        logger.info("All database initializations completed successfully.")
    except Exception as e:
        logger.critical(f"Database initialization failed during startup: {e}")
        # We don't crash the server here so it can serve health checks or direct API errors,
        # but we log the critical issue.

# --- EXCEPTION HANDLING MIDDLEWARE / HANDLERS ---

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"Input validation failure on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "message": "Invalid input formatting or structure.",
            "details": exc.errors()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP exception: status_code={exc.status_code}, detail={exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "message": exc.detail
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log complete internal details but mask tracebacks from the client response
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    
    error_type = type(exc).__name__
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    message = "An unexpected error occurred while processing your request."

    # Identify specific known failure conditions
    if "API_KEY" in str(exc) or "API key" in str(exc):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        message = "GenAI Service configuration error: Missing or invalid API key."
    elif "quota" in str(exc).lower() or "429" in str(exc):
        status_code = status.HTTP_429_TOO_MANY_REQUESTS
        message = "Gemini API rate limits exceeded. Please retry shortly."
    elif "timeout" in str(exc).lower() or "deadline" in str(exc).lower():
        status_code = status.HTTP_504_GATEWAY_TIMEOUT
        message = "Gemini API operations timed out."
    elif "chroma" in str(exc).lower() or "sqlite" in str(exc).lower():
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        message = "Internal database service failure."

    return JSONResponse(
        status_code=status_code,
        content={
            "error": error_type,
            "message": message
        }
    )

# --- REQUEST LOGGING MIDDLEWARE ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming Request: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    logger.info(f"Completed Request: {request.method} {request.url.path} - Status: {response.status_code} - Duration: {duration:.4f}s")
    return response


# --- ENDPOINTS ---

@app.get("/health", response_model=HealthResponse)
def health_check():
    """
    Returns the server status.
    """
    return HealthResponse(status="healthy")


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Main chat gateway endpoint.
    Performs memory lookup, RAG retrieval, threshold checks, LLM generation, logs parameters,
    and updates session history.
    """
    session_id = request.sessionId.strip()
    user_msg = request.message.strip()

    if not session_id:
        raise HTTPException(status_code=400, detail="Invalid session ID.")
    if not user_msg:
        raise HTTPException(status_code=400, detail="Empty messages are not accepted.")

    # Step 1: Query local memory repository for history
    try:
        chat_history = memory_service.get_messages(session_id)
    except Exception as e:
        logger.error(f"Error fetching memory history for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve chat session memory.")

    # Step 2: Context Retrieval via RAG Service
    start_retrieval = time.time()
    try:
        rag_res = rag_service.retrieve_context(user_msg)
    except Exception as e:
        logger.error(f"RAG search execution failed: {e}")
        raise HTTPException(status_code=500, detail="Error during context retrieval search.")
    
    retrieval_latency = time.time() - start_retrieval
    logger.info(f"RAG retrieval executed in {retrieval_latency:.4f}s")

    # Step 3: Handle RAG pipeline failures (e.g. threshold limits)
    if rag_res["status"] == "threshold_failed":
        fallback_reply = "I could not find enough information in the knowledge base to answer this question."
        
        # Log similarity scores
        logger.info(f"Similarity scores failed threshold filtering. Scores: {rag_res['scores']}")
        
        # Save exchange in history even for threshold failures (optional but keeps conversational flow)
        try:
            memory_service.add_message(session_id, "user", user_msg)
            memory_service.add_message(session_id, "assistant", fallback_reply)
        except Exception as e:
            logger.error(f"Failed to record conversation context: {e}")

        return ChatResponse(
            reply=fallback_reply,
            tokensUsed=0,
            retrievedChunks=0,
            similarityScores=rag_res["scores"]
        )

    # Step 4: Invoke Grounded Generative LLM
    try:
        reply_content, tokens_used = llm_service.generate_response(
            query=user_msg,
            context=rag_res["context"],
            history=chat_history
        )
    except Exception as e:
        logger.error(f"Failed to invoke LLM: {e}")
        err_msg = str(e).lower()
        if "quota" in err_msg or "429" in err_msg:
            raise HTTPException(status_code=429, detail="Gemini API rate limits exceeded. Please retry shortly.")
        elif "api_key" in err_msg or "api key" in err_msg:
            raise HTTPException(status_code=503, detail="GenAI Service configuration error: Missing or invalid API key.")
        elif "timeout" in err_msg or "deadline" in err_msg:
            raise HTTPException(status_code=504, detail="Gemini API operations timed out.")
        raise HTTPException(status_code=502, detail="GenAI Service is currently unreachable or failed to generate content.")

    # Step 5: Save exchange in history
    try:
        memory_service.add_message(session_id, "user", user_msg)
        memory_service.add_message(session_id, "assistant", reply_content)
    except Exception as e:
        logger.error(f"Failed to commit conversation history: {e}")

    # Return standard structured API payload
    return ChatResponse(
        reply=reply_content,
        tokensUsed=tokens_used,
        retrievedChunks=len(rag_res["chunks"]),
        similarityScores=rag_res["scores"]
    )
