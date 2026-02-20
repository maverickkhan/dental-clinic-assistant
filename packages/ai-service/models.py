from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    """Single chat message in history."""
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """Request model for chat generation."""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    patient_name: str = Field(..., min_length=1, description="Patient's name")
    medical_notes: Optional[str] = Field(None, description="Patient's medical notes")
    chat_history: List[ChatHistoryItem] = Field(default_factory=list, description="Recent chat history")


class ChatResponse(BaseModel):
    """Response model for chat generation."""
    response: str = Field(..., description="AI-generated response")
    metadata: dict = Field(..., description="Metadata about the generation")
    emergency_detected: bool = Field(default=False, description="Whether emergency keywords were detected")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    model: str
