from pydantic import BaseModel, Field
from typing import List, Optional

class ChatRequest(BaseModel):
    sessionId: str = Field(..., description="The unique session identifier for tracking conversation history.", min_length=1)
    message: str = Field(..., description="The query or message sent by the user.", min_length=1)

class ChatResponse(BaseModel):
    reply: str = Field(..., description="The grounding-checked assistant response.")
    tokensUsed: int = Field(..., description="Total token consumption recorded for the transaction.")
    retrievedChunks: int = Field(..., description="Number of text chunks successfully retrieved and utilized.")
    similarityScores: List[float] = Field(..., description="Raw similarity scores of the retrieved matches.")

class HealthResponse(BaseModel):
    status: str = Field(..., description="The operational health status of the service.")

class UserRegister(BaseModel):
    username: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

class FeedbackRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    name: str
    size: int
    status: str
    chunk_count: int
    created_at: str

class AnalyticsResponse(BaseModel):
    total_users: int
    total_documents: int
    total_conversations: int
    total_messages: int
    average_similarity_score: float
    total_tokens_used: int

class LogResponse(BaseModel):
    id: int
    level: str
    module: str
    message: str
    details_json: Optional[str] = None
    created_at: str
