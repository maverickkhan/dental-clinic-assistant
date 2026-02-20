from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"
    port: int = 8001

    # Redis configuration (optional, for message queue)
    redis_url: str = "redis://localhost:6379"

    # AI configuration
    max_output_tokens: int = 2048
    temperature: float = 0.7
    max_chat_history: int = 5
    max_medical_notes_length: int = 500

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
