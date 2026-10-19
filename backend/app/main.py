"""FairFarm FastAPI Backend Application Entrypoint.

Agricultural direct marketplace platform with NetProfit analysis,
shared transport pooling, and multilingual voice capabilities.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import acreate_client, AsyncClient

from app.config import settings
from app.routers import auth, offers, orders, produce, transport, voice


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to initialize async Supabase client."""
    # Use service role key for backend operations if provided, otherwise fallback to anon key
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    app.state.supabase = await acreate_client(settings.SUPABASE_URL, key)
    yield


app = FastAPI(
    title="FairFarm API",
    description="Fair, transparent agricultural marketplace for Indian farmers and buyers. Currency: INR (₹).",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers under /api/ prefix
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & Profiles"])
app.include_router(produce.router, prefix="/api/produce", tags=["Produce Listings"])
app.include_router(offers.router, prefix="/api/offers", tags=["Offers & NetProfit"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(transport.router, prefix="/api/transport", tags=["Shared Transport"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice & TTS"])


@app.get(
    "/health",
    summary="Health check endpoint",
    tags=["System"],
)
async def health_check():
    """Health check endpoint to verify backend service availability."""
    return {
        "status": "ok",
        "service": "FairFarm API",
        "version": "1.0.0",
        "currency": "INR (₹)",
    }
