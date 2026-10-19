"""Offers Router for FairFarm.

Allows buyers to submit purchase offers, view their submitted offers, and withdraw them.
Allows farmers to inspect offers, run NetProfit comparisons, and accept or reject offers.
"""

from typing import Any, Dict, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from supabase._async.client import AsyncClient

from app.dependencies import get_supabase, require_buyer, require_farmer
from app.models.schemas import NetProfitResult, OfferCreate
from app.services.netprofit import calculate_net_profit

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Submit a purchase offer on a produce listing (Buyer only)",
)
async def submit_offer(
    payload: OfferCreate,
    current_buyer: Dict[str, Any] = Depends(require_buyer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Submit a purchase offer.

    Validates that the produce listing is active and that the requested
    quantity does not exceed available stock.
    """
    listing_id_str = str(payload.listing_id)

    # 1. Check produce listing exists and is active
    listing_res = (
        await supabase.table("produce_listings")
        .select("id, farmer_id, available_quantity_kg, status, category, latitude, longitude")
        .eq("id", listing_id_str)
        .execute()
    )

    if not listing_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produce listing '{payload.listing_id}' not found.",
        )

    listing = listing_res.data[0]

    if listing.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit an offer for a listing with status '{listing.get('status')}'.",
        )

    available_qty = float(listing.get("available_quantity_kg", 0.0))
    if payload.quantity_kg > available_qty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Requested quantity ({payload.quantity_kg} kg) exceeds "
                f"available inventory ({available_qty} kg)."
            ),
        )

    # Prevent offering on own listing
    if str(listing.get("farmer_id")) == current_buyer["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmers cannot submit purchase offers on their own produce listings.",
        )

    offer_payload = payload.model_dump()
    offer_payload["listing_id"] = listing_id_str
    offer_payload["buyer_id"] = current_buyer["id"]
    offer_payload["status"] = "pending"

    try:
        insert_res = (
            await supabase.table("offers")
            .insert(offer_payload)
            .execute()
        )
        if not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record offer in database.",
            )
        return insert_res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting offer: {str(exc)}",
        ) from exc


@router.get(
    "/listing/{listing_id}",
    summary="Get all offers on a produce listing (Farmer owner only)",
)
async def get_listing_offers(
    listing_id: UUID,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[Dict[str, Any]]:
    """Retrieve all submitted offers for a specific listing owned by the farmer."""
    # Verify farmer ownership of listing
    listing_res = (
        await supabase.table("produce_listings")
        .select("id, farmer_id")
        .eq("id", str(listing_id))
        .execute()
    )
    if not listing_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing '{listing_id}' not found.",
        )

    if str(listing_res.data[0]["farmer_id"]) != current_farmer["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view offers for your own produce listings.",
        )

    try:
        offers_res = (
            await supabase.table("offers")
            .select("*, buyer:profiles(id, full_name, phone, business_name, business_type, location, latitude, longitude)")
            .eq("listing_id", str(listing_id))
            .order("created_at", desc=True)
            .execute()
        )
        return offers_res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch offers: {str(exc)}",
        ) from exc


@router.get(
    "/my",
    summary="Get all offers made by the current buyer",
)
async def get_my_offers(
    current_buyer: Dict[str, Any] = Depends(require_buyer),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[Dict[str, Any]]:
    """Retrieve all purchase offers submitted by the authenticated buyer."""
    try:
        offers_res = (
            await supabase.table("offers")
            .select("*, listing:produce_listings(*)")
            .eq("buyer_id", current_buyer["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return offers_res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve your offers: {str(exc)}",
        ) from exc


@router.post(
    "/{id}/accept",
    summary="Accept an offer and atomically generate an order (Farmer only)",
)
async def accept_offer(
    id: UUID,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Atomically accept an offer and create an order via database transaction.

    Calls the PostgreSQL stored function accept_offer_and_create_order to ensure
    race-condition-safe inventory decrement and automatic rejection of unfulfillable offers.
    """
    try:
        rpc_res = await supabase.rpc(
            "accept_offer_and_create_order",
            {
                "p_offer_id": str(id),
                "p_farmer_id": current_farmer["id"],
            },
        ).execute()

        if rpc_res.data:
            return {
                "message": "Offer accepted successfully and order created.",
                "details": rpc_res.data,
            }

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer acceptance transaction failed to return order confirmation.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        error_msg = str(exc)
        if "Offer not found" in error_msg:
            raise HTTPException(status_code=404, detail="Offer not found.")
        if "Insufficient quantity" in error_msg:
            raise HTTPException(status_code=400, detail="Insufficient quantity available.")
        if "You do not own this listing" in error_msg:
            raise HTTPException(status_code=403, detail="You do not own this listing.")
        if "Offer is no longer pending" in error_msg:
            raise HTTPException(status_code=400, detail=error_msg)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing offer acceptance: {error_msg}",
        ) from exc


@router.post(
    "/{id}/reject",
    summary="Reject an offer (Farmer owner only)",
)
async def reject_offer(
    id: UUID,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Reject a pending offer submitted by a buyer."""
    # Find offer and check listing ownership
    offer_res = (
        await supabase.table("offers")
        .select("id, listing_id, status, produce_listings(farmer_id)")
        .eq("id", str(id))
        .execute()
    )

    if not offer_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer '{id}' not found.",
        )

    offer_data = offer_res.data[0]
    listing_info = offer_data.get("produce_listings") or {}
    farmer_id = (
        listing_info.get("farmer_id")
        if isinstance(listing_info, dict)
        else None
    )

    if str(farmer_id) != current_farmer["id"]:
        # Double check directly on produce_listings in case of join format
        direct_listing = (
            await supabase.table("produce_listings")
            .select("farmer_id")
            .eq("id", offer_data["listing_id"])
            .execute()
        )
        if not direct_listing.data or str(direct_listing.data[0]["farmer_id"]) != current_farmer["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to reject this offer.",
            )

    if offer_data.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject offer with status '{offer_data.get('status')}'.",
        )

    try:
        res = (
            await supabase.table("offers")
            .update({"status": "rejected"})
            .eq("id", str(id))
            .execute()
        )
        return {
            "message": "Offer rejected.",
            "offer": res.data[0] if res.data else {"id": str(id), "status": "rejected"},
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject offer: {str(exc)}",
        ) from exc


@router.post(
    "/{id}/withdraw",
    summary="Withdraw a pending offer (Buyer who made the offer only)",
)
async def withdraw_offer(
    id: UUID,
    current_buyer: Dict[str, Any] = Depends(require_buyer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Withdraw a pending offer submitted by the authenticated buyer."""
    offer_res = (
        await supabase.table("offers")
        .select("id, buyer_id, status")
        .eq("id", str(id))
        .execute()
    )

    if not offer_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer '{id}' not found.",
        )

    offer_data = offer_res.data[0]
    if str(offer_data["buyer_id"]) != current_buyer["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only withdraw your own offers.",
        )

    if offer_data.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot withdraw offer with status '{offer_data.get('status')}'.",
        )

    try:
        res = (
            await supabase.table("offers")
            .update({"status": "withdrawn"})
            .eq("id", str(id))
            .execute()
        )
        return {
            "message": "Offer withdrawn successfully.",
            "offer": res.data[0] if res.data else {"id": str(id), "status": "withdrawn"},
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to withdraw offer: {str(exc)}",
        ) from exc


@router.get(
    "/listing/{listing_id}/netprofit",
    summary="Calculate NetProfit comparison for all pending offers on a listing (Farmer only)",
    response_model=List[NetProfitResult],
)
async def get_listing_netprofit(
    listing_id: UUID,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[NetProfitResult]:
    """Compute NetProfit analysis ranking for all pending offers on a produce listing.

    Deducts transport logistics costs, category perishability loss, and handling fees
    to reveal the most profitable buyer offer.
    """
    # 1. Fetch listing and verify ownership
    listing_res = (
        await supabase.table("produce_listings")
        .select("*")
        .eq("id", str(listing_id))
        .execute()
    )
    if not listing_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing '{listing_id}' not found.",
        )

    listing_data = listing_res.data[0]
    if str(listing_data["farmer_id"]) != current_farmer["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only compute NetProfit rankings for your own listings.",
        )

    # 2. Fetch all pending offers for this listing
    offers_res = (
        await supabase.table("offers")
        .select("*")
        .eq("listing_id", str(listing_id))
        .eq("status", "pending")
        .execute()
    )

    pending_offers = offers_res.data or []
    if not pending_offers:
        return []

    # 3. Compute NetProfit rankings using service logic
    return calculate_net_profit(pending_offers, listing_data)
