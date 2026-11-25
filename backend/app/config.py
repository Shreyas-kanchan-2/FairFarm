"""Configuration module for FairFarm backend."""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    # Supabase Configuration
    SUPABASE_URL: str = Field(
        default="https://your-project.supabase.co",
        description="Supabase project URL",
    )
    SUPABASE_ANON_KEY: str = Field(
        default="",
        description="Supabase anonymous public API key",
    )
    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        default="",
        description="Supabase service role secret API key for admin operations",
    )

    # ElevenLabs Voice AI
    ELEVENLABS_API_KEY: Optional[str] = Field(
        default=None,
        description="ElevenLabs API key for Text-to-Speech",
    )
    ELEVENLABS_VOICE_ID: str = Field(
        default="21m00Tcm4TlvDq8ikWAM",
        description="Default ElevenLabs Voice ID (Rachel)",
    )

    # Application & CORS
    BACKEND_PORT: int = Field(default=8000, description="Port for backend server")
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        description="Comma-separated list of allowed CORS origins",
    )

    # e-NAM / OGD Mandi Price API
    DATA_GOV_API_KEY: Optional[str] = Field(
	default=None,
  	description="API key from data.gov.in for daily mandi commodity prices",
    )
    
	
    model_config = SettingsConfigDict(
   	 env_file=(".env", "../.env", "../../.env"),
  	 env_file_encoding="utf-8",
    	 extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Return CORS origins as a trimmed list of strings."""
        if not self.CORS_ORIGINS:
            return ["*"]
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()

MANDI_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
MANDI_API_URL = f"https://api.data.gov.in/resource/{MANDI_RESOURCE_ID}"