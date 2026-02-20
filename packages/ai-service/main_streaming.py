"""
Streaming version of AI service using Server-Sent Events (SSE)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import logging
import json

from config import settings
from models import ChatRequest, HealthResponse
from services.gemini_streaming_service import GeminiStreamingService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global service instance
gemini_service: GeminiStreamingService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global gemini_service

    # Startup
    logger.info("🚀 Starting AI Microservice (Streaming)...")
    logger.info(f"Model: {settings.gemini_model}")
    gemini_service = GeminiStreamingService()
    logger.info("✅ AI Microservice ready with streaming support")

    yield

    # Shutdown
    logger.info("Shutting down AI Microservice...")


# Create FastAPI app
app = FastAPI(
    title="Dental Clinic AI Service (Streaming)",
    description="AI microservice with streaming responses using Google Gemini",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="ai-service-streaming",
        model=settings.gemini_model
    )


@app.post("/api/chat/stream")
async def stream_chat_response(request: ChatRequest):
    """
    Stream AI response character-by-character using Server-Sent Events.

    Returns text/event-stream with chunks of the AI response.
    """
    async def event_generator():
        """Generate SSE events for streaming response."""
        try:
            logger.info(f"Streaming chat for patient: {request.patient_name}")

            # Check for emergency first
            if gemini_service.detect_emergency(request.message):
                # Send emergency response immediately (all at once)
                emergency_text = gemini_service.EMERGENCY_RESPONSE
                yield f"data: {json.dumps({'type': 'emergency', 'text': emergency_text})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'metadata': {'emergency_detected': True}})}\n\n"
                return

            # Stream AI response chunk by chunk
            full_text = ""
            async for chunk in gemini_service.generate_response_stream(
                message=request.message,
                patient_name=request.patient_name,
                medical_notes=request.medical_notes,
                chat_history=request.chat_history
            ):
                full_text += chunk

                # Send chunk to client
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

            # Send completion event with metadata
            yield f"data: {json.dumps({'type': 'done', 'metadata': {'model': settings.gemini_model}})}\n\n"

        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Dental Clinic AI Service (Streaming)",
        "version": "1.0.0",
        "status": "running",
        "features": ["streaming", "sse"],
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_streaming:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True
    )
