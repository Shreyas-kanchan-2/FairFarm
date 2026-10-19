"""Produce Listings Router for FairFarm.

Allows farmers to publish, update, and manage listings of agricultural produce,
and buyers to discover, filter, and inspect listings.
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase._async.client import AsyncClient

from app.dependencies import get_supabase, require_farmer
from app.models.schemas import ProduceListingCreate, ProduceListingUpdate

router = APIRouter()


def _serialize_dates(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert date and datetime objects to ISO strings for database insertion."""
    clean = {}
    for k, v in data.items():
        if isinstance(v, (date, datetime)):
            clean[k] = v.isoformat()
        else:
            clean[k] = v
    return clean


@router.get(
    "/",
    summary="List active produce listings with filters and pagination",
)
async def list_produce(
    category: Optional[str] = Query(None, description="Filter by produce category"),
    location: Optional[str] = Query(None, description="Case-insensitive filter by location text"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price per kg (₹)"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price per kg (₹)"),
    is_organic: Optional[bool] = Query(None, description="Filter for certified organic produce"),
    search: Optional[str] = Query(None, description="Keyword search against produce name"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Browse active marketplace produce listings with filtering and pagination."""
    query = (
        supabase.table("produce_listings")
        .select("*, farmer:profiles(id, full_name, phone, business_name, location, latitude, longitude)")
        .eq("status", "active")
    )

    if category:
        query = query.eq("category", category.lower())
    if location:
        query = query.ilike("location", f"%{location}%")
    if min_price is not None:
        query = query.gte("price_per_kg", min_price)
    if max_price is not None:
        query = query.lte("price_per_kg", max_price)
    if is_organic is not None:
        query = query.eq("is_organic", is_organic)
    if search:
        query = query.ilike("produce_name", f"%{search}%")

    # Ordering and pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size - 1

    query = query.order("created_at", desc=True).range(start_index, end_index)

    try:
        res = await query.execute()
        listings = res.data or []
        return {
            "page": page,
            "page_size": page_size,
            "count": len(listings),
            "listings": listings,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query produce listings: {str(exc)}",
        ) from exc


@router.get(
    "/{id}",
    summary="Get single produce listing details",
)
async def get_produce_listing(
    id: UUID,
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Retrieve full details of a specific produce listing, including farmer contact info."""
    try:
        res = (
            await supabase.table("produce_listings")
            .select("*, farmer:profiles(id, full_name, phone, business_name, location, latitude, longitude)")
            .eq("id", str(id))
            .execute()
        )
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produce listing with ID '{id}' was not found.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving listing: {str(exc)}",
        ) from exc


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new produce listing (Farmer only)",
)
async def create_produce_listing(
    payload: ProduceListingCreate,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Publish a fresh produce listing.

    Only authenticated farmers can create listings. Sets available_quantity_kg
    equal to initial quantity_kg.
    """
    listing_dict = payload.model_dump()
    listing_dict["farmer_id"] = current_farmer["id"]
    listing_dict["available_quantity_kg"] = payload.quantity_kg
    listing_dict["status"] = "active"

    clean_payload = _serialize_dates(listing_dict)

    try:
        res = (
            await supabase.table("produce_listings")
            .insert(clean_payload)
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create produce listing in database.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating listing: {str(exc)}",
        ) from exc


@router.put(
    "/{id}",
    summary="Update produce listing (Listing owner only)",
)
async def update_produce_listing(
    id: UUID,
    payload: ProduceListingUpdate,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Update details of an existing produce listing.

    Farmers may only update listings that they own.
    """
    # Verify ownership
    existing_res = (
        await supabase.table("produce_listings")
        .select("id, farmer_id")
        .eq("id", str(id))
        .execute()
    )
    if not existing_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing '{id}' not found.",
        )

    listing_owner_id = str(existing_res.data[0]["farmer_id"])
    if listing_owner_id != current_farmer["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this listing.",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    if not update_dict:
        # No fields to update, fetch current
        curr = (
            await supabase.table("produce_listings")
            .select("*")
            .eq("id", str(id))
            .single()
            .execute()
        )
        return curr.data

    clean_payload = _serialize_dates(update_dict)

    try:
        res = (
            await supabase.table("produce_listings")
            .update(clean_payload)
            .eq("id", str(id))
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update listing.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating listing: {str(exc)}",
        ) from exc


@router.delete(
    "/{id}",
    summary="Soft-delete produce listing (Listing owner only)",
)
async def delete_produce_listing(
    id: UUID,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Soft-delete a produce listing by marking status as 'expired'."""
    # Verify ownership
    existing_res = (
        await supabase.table("produce_listings")
        .select("id, farmer_id, status")
        .eq("id", str(id))
        .execute()
    )
    if not existing_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing '{id}' not found.",
        )

    listing_owner_id = str(existing_res.data[0]["farmer_id"])
    if listing_owner_id != current_farmer["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this listing.",
        )

    try:
        res = (
            await supabase.table("produce_listings")
            .update({"status": "expired"})
            .eq("id", str(id))
            .execute()
        )
        return {
            "message": "Listing successfully expired.",
            "listing_id": str(id),
            "status": "expired",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error expiring listing: {str(exc)}",
        ) from exc
