from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from models import ChatRequest, ChatResponse, HealthResponse
from services.gemini_service import GeminiService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global service instance
gemini_service: GeminiService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global gemini_service

    # Startup
    logger.info("🚀 Starting AI Microservice...")
    logger.info(f"Model: {settings.gemini_model}")
    gemini_service = GeminiService()
    logger.info("✅ AI Microservice ready")

    yield

    # Shutdown
    logger.info("Shutting down AI Microservice...")


# Create FastAPI app
app = FastAPI(
    title="Dental Clinic AI Service",
    description="AI microservice for patient chat using Google Gemini",
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
        service="ai-service",
        model=settings.gemini_model
    )


@app.post("/api/chat/generate", response_model=ChatResponse)
async def generate_chat_response(request: ChatRequest):
    """
    Generate AI response for patient chat.

    This endpoint accepts a chat message along with patient context
    and returns an AI-generated response.
    """
    try:
        logger.info(f"Processing chat request for patient: {request.patient_name}")

        response_text, metadata, emergency_detected = await gemini_service.generate_response(
            message=request.message,
            patient_name=request.patient_name,
            medical_notes=request.medical_notes,
            chat_history=request.chat_history
        )

        return ChatResponse(
            response=response_text,
            metadata=metadata,
            emergency_detected=emergency_detected
        )

    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Dental Clinic AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True
    )
