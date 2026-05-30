from pydantic import BaseModel, Field
from typing import List

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
