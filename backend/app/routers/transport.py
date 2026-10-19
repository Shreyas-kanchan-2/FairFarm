"""Transport Router for FairFarm.

Allows farmers to create shared logistics transport requests, view their
active requests, and discover route-sharing matches with nearby farmers.
"""

from datetime import date
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase._async.client import AsyncClient

from app.dependencies import get_supabase, require_farmer
from app.models.schemas import TransportRequestCreate
from app.services.transport_matcher import match_transport_requests

router = APIRouter()


@router.post(
    "/request",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new transport request (Farmer only)",
)
async def create_transport_request(
    payload: TransportRequestCreate,
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Publish a request for shared agricultural logistics/transport."""
    req_dict = payload.model_dump()
    req_dict["farmer_id"] = current_farmer["id"]
    req_dict["status"] = "open"
    if req_dict.get("listing_id"):
        req_dict["listing_id"] = str(req_dict["listing_id"])
    if isinstance(req_dict.get("preferred_date"), date):
        req_dict["preferred_date"] = req_dict["preferred_date"].isoformat()

    try:
        res = (
            await supabase.table("transport_requests")
            .insert(req_dict)
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create transport request in database.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating transport request: {str(exc)}",
        ) from exc


@router.get(
    "/my-requests",
    summary="Get all transport requests for current farmer",
)
async def get_my_transport_requests(
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[Dict[str, Any]]:
    """Retrieve all transport requests created by the authenticated farmer."""
    try:
        res = (
            await supabase.table("transport_requests")
            .select("*, listing:produce_listings(id, produce_name, category)")
            .eq("farmer_id", current_farmer["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transport requests: {str(exc)}",
        ) from exc


@router.get(
    "/matches/{request_id}",
    summary="Find nearby transport matches for a request (Farmer only)",
)
async def get_transport_matches(
    request_id: UUID,
    max_origin_distance_km: float = Query(
        25.0, ge=1.0, le=200.0, description="Max distance from pickup origin in km"
    ),
    max_dest_distance_km: float = Query(
        30.0, ge=1.0, le=200.0, description="Max distance from dropoff destination in km"
    ),
    date_range_days: int = Query(
        2, ge=0, le=14, description="Maximum day difference around preferred date"
    ),
    current_farmer: Dict[str, Any] = Depends(require_farmer),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[Dict[str, Any]]:
    """Discover route-sharing matches using the PostgreSQL find_transport_matches function.

    Falls back to Python service matching if necessary.
    """
    # 1. Fetch base transport request
    base_res = (
        await supabase.table("transport_requests")
        .select("*")
        .eq("id", str(request_id))
        .execute()
    )

    if not base_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transport request '{request_id}' not found.",
        )

    base_req = base_res.data[0]
    if str(base_req["farmer_id"]) != current_farmer["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only search for matches on your own transport requests.",
        )

    # 2. Try invoking PostgreSQL RPC function
    try:
        rpc_res = await supabase.rpc(
            "find_transport_matches",
            {
                "p_request_id": str(request_id),
                "p_max_origin_distance_km": max_origin_distance_km,
                "p_max_dest_distance_km": max_dest_distance_km,
                "p_date_range_days": date_range_days,
            },
        ).execute()

        if rpc_res.data is not None:
            return rpc_res.data
    except Exception:
        # If database RPC is unavailable or encounters a schema difference, fallback to Python matcher
        pass

    # 3. Fallback to Python-based service matcher
    try:
        candidates_res = (
            await supabase.table("transport_requests")
            .select("*, farmer:profiles(id, full_name, phone, business_name)")
            .eq("status", "open")
            .execute()
        )
        candidates = candidates_res.data or []
        return match_transport_requests(
            base_request=base_req,
            candidate_requests=candidates,
            max_origin_distance_km=max_origin_distance_km,
            max_dest_distance_km=max_dest_distance_km,
            date_range_days=date_range_days,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to find transport matches: {str(exc)}",
        ) from exc
