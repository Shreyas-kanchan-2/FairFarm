"""Orders Router for FairFarm.

Allows farmers and buyers to view their orders, inspect order details,
and update order fulfillment status.
"""

from typing import Any, Dict, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from supabase._async.client import AsyncClient

from app.dependencies import get_current_user, get_supabase
from app.models.schemas import OrderStatusUpdate

router = APIRouter()


@router.get(
    "/",
    summary="Get user's orders (filtered by farmer or buyer role)",
)
async def list_orders(
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[Dict[str, Any]]:
    """Retrieve orders for the authenticated user, tailored to their role."""
    user_id = current_user["id"]
    role = current_user.get("role")

    query = supabase.table("orders").select(
        "*, listing:produce_listings(*)"
    )

    if role == "farmer":
        query = query.eq("farmer_id", user_id)
    elif role == "buyer":
        query = query.eq("buyer_id", user_id)
    else:
        query = query.or_(f"farmer_id.eq.{user_id},buyer_id.eq.{user_id}")

    try:
        res = await query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(exc)}",
        ) from exc


@router.get(
    "/{id}",
    summary="Get order details by ID",
)
async def get_order_details(
    id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Retrieve detailed order information.

    Accessible only to the participating farmer or buyer.
    """
    user_id = current_user["id"]

    try:
        res = (
            await supabase.table("orders")
            .select("*, listing:produce_listings(*)")
            .eq("id", str(id))
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order '{id}' not found.",
            )

        order = res.data[0]

        # Check authorization
        if str(order["farmer_id"]) != user_id and str(order["buyer_id"]) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this order.",
            )

        # Retrieve profile details for both participants
        farmer_res = (
            await supabase.table("profiles")
            .select("id, full_name, phone, business_name, location")
            .eq("id", order["farmer_id"])
            .execute()
        )
        buyer_res = (
            await supabase.table("profiles")
            .select("id, full_name, phone, business_name, location")
            .eq("id", order["buyer_id"])
            .execute()
        )

        order["farmer"] = farmer_res.data[0] if farmer_res.data else None
        order["buyer"] = buyer_res.data[0] if buyer_res.data else None

        return order
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving order: {str(exc)}",
        ) from exc


@router.put(
    "/{id}/status",
    summary="Update order fulfillment status",
)
async def update_order_status(
    id: UUID,
    payload: OrderStatusUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Update order fulfillment status (e.g. in_transit, delivered, completed, cancelled).

    Only participating farmers or buyers may update their order status.
    """
    user_id = current_user["id"]

    # Verify order exists and check participant authorization
    existing_res = (
        await supabase.table("orders")
        .select("id, farmer_id, buyer_id, status")
        .eq("id", str(id))
        .execute()
    )

    if not existing_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{id}' not found.",
        )

    order = existing_res.data[0]
    if str(order["farmer_id"]) != user_id and str(order["buyer_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this order.",
        )

    try:
        update_res = (
            await supabase.table("orders")
            .update({"status": payload.status})
            .eq("id", str(id))
            .execute()
        )
        if not update_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order status.",
            )
        return update_res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order status: {str(exc)}",
        ) from exc
