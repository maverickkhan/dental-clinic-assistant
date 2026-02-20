import httpx
from typing import List, Tuple
from config import settings
from models import ChatHistoryItem
import logging

logger = logging.getLogger(__name__)

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{{}}: generateContent"


class GeminiService:
    """Service for interacting with Google Gemini API via direct REST calls."""

    EMERGENCY_KEYWORDS = [
        "severe pain", "bleeding", "swollen", "emergency", "accident",
        "broken tooth", "knocked out", "unbearable", "can't eat",
        "can't sleep", "infection", "abscess"
    ]

    EMERGENCY_RESPONSE = """⚠️ IMPORTANT: Based on your message, this may require immediate attention. Please contact the clinic directly at your earliest convenience. If this is a dental emergency (severe pain, bleeding, or trauma), please call our emergency line or visit the nearest emergency dental clinic immediately.

For reference, common dental emergencies include:
- Severe, persistent toothache
- Knocked-out tooth
- Broken or chipped tooth with pain
- Severe bleeding that won't stop
- Swelling in the mouth or face
- Abscess or infection

Our clinic staff will be able to provide immediate guidance and schedule an urgent appointment if needed."""

    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        self.headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": self.api_key,
        }

    def detect_emergency(self, message: str) -> bool:
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.EMERGENCY_KEYWORDS)

    def build_system_prompt(self, patient_name: str, medical_notes: str | None) -> str:
        truncated_notes = "No medical notes available"
        if medical_notes:
            truncated_notes = medical_notes[:settings.max_medical_notes_length]
            if len(medical_notes) > settings.max_medical_notes_length:
                truncated_notes += "..."

        return f"""You are a knowledgeable and empathetic dental assistant AI helping clinic staff communicate with patients.

IMPORTANT GUIDELINES:
- Provide professional, concise (2-3 paragraphs max), non-technical responses
- Focus on dental procedures, care instructions, and general dental health questions
- Use simple, patient-friendly language
- Be warm, empathetic, and reassuring
- NEVER diagnose medical conditions or prescribe treatments
- NEVER provide specific medical advice - always defer to the dentist
- For emergencies (severe pain, bleeding, trauma), advise immediate contact with clinic or emergency services
- If unsure, recommend scheduling an appointment with the dentist

PATIENT CONTEXT:
- Patient Name: {patient_name}
- Medical Notes: {truncated_notes}

Remember: You are assisting clinic staff in communicating with patients, not replacing professional dental advice."""

    def build_conversation_history(self, chat_history: List[ChatHistoryItem]) -> str:
        if not chat_history:
            return ""
        recent_messages = chat_history[-settings.max_chat_history:]
        formatted_messages = []
        for msg in recent_messages:
            role = "User" if msg.role == "user" else "Assistant"
            formatted_messages.append(f"{role}: {msg.content}")
        return "\n\n".join(formatted_messages)

    async def generate_response(
        self,
        message: str,
        patient_name: str,
        medical_notes: str | None,
        chat_history: List[ChatHistoryItem]
    ) -> Tuple[str, dict, bool]:
        if self.detect_emergency(message):
            return self.EMERGENCY_RESPONSE, {"emergency_detected": True}, True

        system_prompt = self.build_system_prompt(patient_name, medical_notes)
        conversation_history = self.build_conversation_history(chat_history)
        full_prompt = f"{system_prompt}\n\n{conversation_history}\n\nUser: {message}\n\nAssistant:"

        body = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": settings.temperature,
                "maxOutputTokens": settings.max_output_tokens,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(self.url, json=body, headers=self.headers)

            if response.status_code != 200:
                error_data = response.json().get("error", {})
                error_msg = error_data.get("message", f"HTTP {response.status_code}")
                logger.error(f"Gemini API error: {error_msg}")

                if response.status_code == 429:
                    raise Exception("AI service is busy, please try again in a moment.")
                if response.status_code == 400 and "expired" in error_msg.lower():
                    raise Exception("AI service configuration error. Please contact support.")
                raise Exception(f"AI service error: {error_msg}")

            data = response.json()
            response_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            finish_reason = data["candidates"][0].get("finishReason", "STOP")

            metadata = {"model": self.model, "finish_reason": finish_reason}
            return response_text, metadata, False

        except httpx.TimeoutException:
            raise Exception("AI service timed out. Please try again.")
        except Exception as e:
            if "AI service" in str(e):
                raise
            raise Exception(f"AI service error: {str(e)}")
