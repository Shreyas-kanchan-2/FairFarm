"""Voice / Text-to-Speech Router for FairFarm.

Provides voice assistance for farmers in local languages using the ElevenLabs API.
Streams audio back directly as audio/mpeg.
"""

from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
import httpx

from app.config import settings
from app.models.schemas import TTSRequest

router = APIRouter()


@router.post(
    "/tts",
    summary="Convert text to speech audio stream via ElevenLabs",
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"audio/mpeg": {}},
            "description": "Streamed MP3 audio format",
        },
        503: {"description": "ElevenLabs service unconfigured or unavailable"},
    },
)
async def text_to_speech(payload: TTSRequest):
    """Convert input text to spoken audio.

    Supports multilingual text (English, Hindi, Kannada) for farmers.
    Streams MP3 audio chunks back to the client.
    """
    api_key = settings.ELEVENLABS_API_KEY
    if not api_key or api_key.strip() in ("", "your-elevenlabs-api-key-here"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "ElevenLabs Text-to-Speech is not configured on this server. "
                "Please set a valid ELEVENLABS_API_KEY in your environment or .env file."
            ),
        )

    voice_id = payload.voice_id or settings.ELEVENLABS_VOICE_ID or "21m00Tcm4TlvDq8ikWAM"
    model_id = payload.model_id or "eleven_multilingual_v2"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"

    request_body = {
        "text": payload.text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    client = httpx.AsyncClient(timeout=30.0)

    try:
        # Initiate the streaming request
        req = client.build_request("POST", url, headers=headers, json=request_body)
        response = await client.send(req, stream=True)

        if response.status_code != 200:
            error_body = await response.aread()
            await client.aclose()
            error_text = error_body.decode("utf-8", errors="replace")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"ElevenLabs TTS generation failed: {error_text}",
            )

        async def stream_audio_generator() -> AsyncGenerator[bytes, None]:
            try:
                async for chunk in response.aiter_bytes(chunk_size=4096):
                    yield chunk
            finally:
                await response.aclose()
                await client.aclose()

        return StreamingResponse(
            stream_audio_generator(),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache",
            },
        )

    except HTTPException:
        await client.aclose()
        raise
    except httpx.RequestError as exc:
        await client.aclose()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network error contacting ElevenLabs API: {str(exc)}",
        ) from exc
    except Exception as exc:
        await client.aclose()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected TTS processing error: {str(exc)}",
        ) from exc
