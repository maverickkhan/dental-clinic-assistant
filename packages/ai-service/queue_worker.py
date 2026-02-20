"""
OPTION 2: Redis Queue Worker

This worker consumes AI requests from Redis queue and publishes responses.
Run this alongside the FastAPI service for queue-based communication.

Usage:
    python queue_worker.py
"""

import asyncio
import json
import logging
from typing import Dict, Any

import redis.asyncio as redis
from config import settings
from services.gemini_service import GeminiService
from models import ChatHistoryItem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QueueWorker:
    """Redis queue worker for processing AI requests."""

    def __init__(self):
        self.redis_client = None
        self.gemini_service = GeminiService()
        self.running = False

    async def start(self):
        """Start the queue worker."""
        logger.info("🚀 Starting AI Queue Worker...")
        logger.info(f"Redis URL: {settings.redis_url}")
        logger.info(f"Model: {settings.gemini_model}")

        self.redis_client = await redis.from_url(settings.redis_url)
        self.running = True

        logger.info("✅ Queue Worker ready, listening for requests...")

        while self.running:
            try:
                # Block and wait for request (BRPOP with 1 second timeout)
                result = await self.redis_client.brpop("ai_requests", timeout=1)

                if result:
                    _, request_data = result
                    await self.process_request(request_data)

            except Exception as e:
                logger.error(f"Error in worker loop: {str(e)}")
                await asyncio.sleep(1)

    async def process_request(self, request_data: bytes):
        """Process a single AI request from queue."""
        try:
            request = json.loads(request_data)
            request_id = request["request_id"]

            logger.info(f"Processing request {request_id} for patient: {request['patient_name']}")

            # Convert chat history to models
            chat_history = [
                ChatHistoryItem(role=msg["role"], content=msg["content"])
                for msg in request.get("chat_history", [])
            ]

            # Generate AI response
            response_text, metadata, emergency_detected = await self.gemini_service.generate_response(
                message=request["message"],
                patient_name=request["patient_name"],
                medical_notes=request.get("medical_notes"),
                chat_history=chat_history
            )

            # Build response
            response = {
                "request_id": request_id,
                "response": response_text,
                "metadata": metadata,
                "emergency_detected": emergency_detected
            }

            # Publish response to specific queue
            response_key = f"ai_responses:{request_id}"
            await self.redis_client.lpush(response_key, json.dumps(response))

            # Set TTL on response (auto-delete after 5 minutes)
            await self.redis_client.expire(response_key, 300)

            logger.info(f"✅ Completed request {request_id}")

        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")

            # Publish error response
            error_response = {
                "request_id": request.get("request_id", "unknown"),
                "response": "",
                "metadata": {},
                "emergency_detected": False,
                "error": str(e)
            }

            response_key = f"ai_responses:{request.get('request_id', 'unknown')}"
            await self.redis_client.lpush(response_key, json.dumps(error_response))
            await self.redis_client.expire(response_key, 300)

    async def stop(self):
        """Stop the queue worker."""
        logger.info("Stopping queue worker...")
        self.running = False
        if self.redis_client:
            await self.redis_client.close()


async def main():
    """Main entry point."""
    worker = QueueWorker()

    try:
        await worker.start()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    finally:
        await worker.stop()


if __name__ == "__main__":
    asyncio.run(main())
