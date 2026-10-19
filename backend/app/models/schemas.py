"""Pydantic schemas and data validation models for FairFarm API."""

from datetime import date, datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# User & Profile Schemas
# ============================================================

UserRole = Literal["farmer", "buyer"]
BusinessType = Literal["retailer", "hotel", "restaurant", "wholesaler"]
LanguageCode = Literal["en", "hi", "kn"]


class UserRegisterRequest(BaseModel):
    """Payload for user registration."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    role: UserRole = Field(..., description="Role: 'farmer' or 'buyer'")
    full_name: str = Field(..., min_length=1, description="Full name of the user")
    phone: Optional[str] = Field(None, description="Phone number with country code")
    preferred_language: Optional[LanguageCode] = Field(
        "en", description="Preferred language ('en', 'hi', 'kn')"
    )
    business_name: Optional[str] = Field(None, description="Optional business or farm name")
    business_type: Optional[BusinessType] = Field(
        None, description="Business type for buyers: retailer, hotel, restaurant, wholesaler"
    )
    location: Optional[str] = Field(None, description="Readable location or address")
    latitude: Optional[float] = Field(None, description="GPS Latitude")
    longitude: Optional[float] = Field(None, description="GPS Longitude")


class UserLoginRequest(BaseModel):
    """Payload for user login."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class ProfileUpdate(BaseModel):
    """Payload for updating user profile."""

    full_name: Optional[str] = Field(None, min_length=1, description="Updated full name")
    phone: Optional[str] = Field(None, description="Updated phone number")
    business_name: Optional[str] = Field(None, description="Updated business or farm name")
    business_type: Optional[BusinessType] = Field(
        None, description="Business type: retailer, hotel, restaurant, wholesaler"
    )
    location: Optional[str] = Field(None, description="Location text description")
    latitude: Optional[float] = Field(None, description="GPS Latitude")
    longitude: Optional[float] = Field(None, description="GPS Longitude")
    preferred_language: Optional[LanguageCode] = Field(
        None, description="Preferred language ('en', 'hi', 'kn')"
    )

    model_config = ConfigDict(extra="ignore")


class ProfileResponse(BaseModel):
    """User profile response model."""

    id: UUID
    role: UserRole
    full_name: str
    phone: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_language: Optional[str] = "en"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ============================================================
# Produce Listing Schemas
# ============================================================

ProduceCategory = Literal[
    "vegetables", "fruits", "grains", "dairy", "spices", "pulses", "oilseeds"
]
ProduceUnit = Literal["kg", "quintal", "dozen", "piece", "litre"]
ListingStatus = Literal["active", "sold_out", "expired"]


class ProduceListingCreate(BaseModel):
    """Payload for creating a new produce listing by a farmer."""

    produce_name: str = Field(..., min_length=1, description="Name of the produce (e.g. Tomato, Wheat)")
    category: ProduceCategory = Field(..., description="Category of the agricultural produce")
    description: Optional[str] = Field(None, description="Detailed description of produce quality/variety")
    quantity_kg: float = Field(..., gt=0, description="Total harvest quantity available in kilograms")
    price_per_kg: float = Field(..., gt=0, description="Base asking price per kg in Indian Rupees (₹)")
    unit: Optional[ProduceUnit] = Field("kg", description="Packaging or measurement unit")
    harvest_date: Optional[date] = Field(None, description="Date of harvest")
    best_before: Optional[date] = Field(None, description="Expiry / shelf life date")
    location: Optional[str] = Field(None, description="Farm or dispatch location")
    latitude: Optional[float] = Field(None, description="Farm Latitude")
    longitude: Optional[float] = Field(None, description="Farm Longitude")
    image_url: Optional[str] = Field(None, description="URL of produce image")
    is_organic: Optional[bool] = Field(False, description="Whether the produce is certified organic")


class ProduceListingUpdate(BaseModel):
    """Payload for updating an existing produce listing."""

    produce_name: Optional[str] = Field(None, min_length=1)
    category: Optional[ProduceCategory] = None
    description: Optional[str] = None
    quantity_kg: Optional[float] = Field(None, gt=0)
    available_quantity_kg: Optional[float] = Field(None, ge=0)
    price_per_kg: Optional[float] = Field(None, gt=0)
    unit: Optional[ProduceUnit] = None
    harvest_date: Optional[date] = None
    best_before: Optional[date] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    is_organic: Optional[bool] = None
    status: Optional[ListingStatus] = None

    model_config = ConfigDict(extra="ignore")


class ProduceListingResponse(BaseModel):
    """Produce listing with optional embedded farmer profile."""

    id: UUID
    farmer_id: UUID
    produce_name: str
    category: str
    description: Optional[str] = None
    quantity_kg: float
    available_quantity_kg: float
    price_per_kg: float
    unit: Optional[str] = "kg"
    harvest_date: Optional[date] = None
    best_before: Optional[date] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    is_organic: Optional[bool] = False
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    farmer: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ============================================================
# Offer Schemas
# ============================================================

PickupOrDelivery = Literal["pickup", "delivery"]
OfferStatus = Literal["pending", "accepted", "rejected", "withdrawn"]


class OfferCreate(BaseModel):
    """Payload for submitting a buyer purchase offer."""

    listing_id: UUID = Field(..., description="Target produce listing UUID")
    offered_price_per_kg: float = Field(..., gt=0, description="Offered price per kg in ₹")
    quantity_kg: float = Field(..., gt=0, description="Quantity requested in kg")
    pickup_or_delivery: Optional[PickupOrDelivery] = Field(
        "pickup", description="'pickup' (buyer collects) or 'delivery' (farmer ships)"
    )
    delivery_location: Optional[str] = Field(None, description="Delivery address if delivery requested")
    delivery_latitude: Optional[float] = Field(None, description="Delivery GPS latitude")
    delivery_longitude: Optional[float] = Field(None, description="Delivery GPS longitude")
    estimated_transport_cost: Optional[float] = Field(
        0.0, ge=0, description="Estimated transport cost in ₹ (if known)"
    )
    estimated_loss_percent: Optional[float] = Field(
        2.0, ge=0, le=100, description="Estimated transit perishability loss percentage"
    )
    message: Optional[str] = Field(None, description="Optional note or terms from the buyer")


class OfferResponse(BaseModel):
    """Buyer offer response model."""

    id: UUID
    listing_id: UUID
    buyer_id: UUID
    offered_price_per_kg: float
    quantity_kg: float
    pickup_or_delivery: str
    delivery_location: Optional[str] = None
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    estimated_transport_cost: Optional[float] = 0.0
    estimated_loss_percent: Optional[float] = 2.0
    message: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    buyer: Optional[Dict[str, Any]] = None
    listing: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ============================================================
# NetProfit Analysis Schemas
# ============================================================


class NetProfitResult(BaseModel):
    """Calculated NetProfit metrics for an offer ranking comparison."""

    offer_id: str = Field(..., description="UUID of the evaluated offer")
    gross_revenue: float = Field(..., description="Gross revenue (Price * Quantity) in ₹")
    transport_cost: float = Field(..., description="Transport logistics cost in ₹")
    loss_cost: float = Field(..., description="Expected perishability loss in ₹")
    handling_cost: float = Field(..., description="Platform & handling fee (2%) in ₹")
    net_profit: float = Field(..., description="Net estimated profit in ₹")
    rank: int = Field(..., description="Relative rank among pending offers (1 = most profitable)")
    explanation: str = Field(..., description="Plain-language justification for the rank and profit margin")


# ============================================================
# Order Schemas
# ============================================================

OrderStatus = Literal["confirmed", "in_transit", "delivered", "completed", "cancelled"]


class OrderStatusUpdate(BaseModel):
    """Payload for updating order lifecycle status."""

    status: OrderStatus = Field(..., description="New order status")


class OrderResponse(BaseModel):
    """Order details response model."""

    id: UUID
    offer_id: UUID
    listing_id: UUID
    farmer_id: UUID
    buyer_id: UUID
    quantity_kg: float
    agreed_price_per_kg: float
    total_amount: float
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    listing: Optional[Dict[str, Any]] = None
    farmer: Optional[Dict[str, Any]] = None
    buyer: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ============================================================
# Transport Request Schemas
# ============================================================

TransportStatus = Literal["open", "matched", "completed"]


class TransportRequestCreate(BaseModel):
    """Payload for creating a shared transport request."""

    listing_id: Optional[UUID] = Field(None, description="Optional associated produce listing")
    origin_location: str = Field(..., min_length=1, description="Origin / Pickup location name")
    origin_lat: float = Field(..., description="Origin latitude")
    origin_lng: float = Field(..., description="Origin longitude")
    destination_location: str = Field(..., min_length=1, description="Destination location name")
    destination_lat: float = Field(..., description="Destination latitude")
    destination_lng: float = Field(..., description="Destination longitude")
    quantity_kg: float = Field(..., gt=0, description="Cargo weight in kilograms")
    preferred_date: date = Field(..., description="Preferred transport / dispatch date")


class TransportRequestResponse(BaseModel):
    """Transport request model."""

    id: UUID
    farmer_id: UUID
    listing_id: Optional[UUID] = None
    origin_location: str
    origin_lat: float
    origin_lng: float
    destination_location: str
    destination_lat: float
    destination_lng: float
    quantity_kg: float
    preferred_date: date
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class TransportMatchResult(BaseModel):
    """Matched transport partner request."""

    match_id: UUID
    farmer_id: UUID
    farmer_name: str
    origin_location: str
    destination_location: str
    quantity_kg: float
    preferred_date: date
    origin_distance_km: float
    dest_distance_km: float
    match_score: float

    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ============================================================
# Voice & ElevenLabs Schemas
# ============================================================


class TTSRequest(BaseModel):
    """Payload for Text-to-Speech audio generation."""

    text: str = Field(..., min_length=1, description="Text to convert to speech")
    voice_id: Optional[str] = Field(None, description="ElevenLabs voice ID override")
    model_id: Optional[str] = Field(
        "eleven_multilingual_v2", description="ElevenLabs model identifier"
    )
