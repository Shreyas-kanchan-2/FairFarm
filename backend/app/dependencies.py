"""FastAPI dependency injection utilities for FairFarm.

Provides async Supabase client access, JWT token validation, and role-based guards.
"""

from typing import Any, Dict, Optional
from fastapi import Depends, Header, HTTPException, Request, status
from supabase._async.client import AsyncClient


async def get_supabase(request: Request) -> AsyncClient:
    """Return the global async Supabase client initialized in app lifespan."""
    supabase: Optional[AsyncClient] = getattr(request.app.state, "supabase", None)
    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase client is not initialized in application state.",
        )
    return supabase


async def get_current_user(
    authorization: Optional[str] = Header(
        None, description="Bearer token for Supabase Auth"
    ),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Validate Supabase JWT from Authorization header and return user profile context."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract Bearer token
    if authorization.startswith("Bearer "):
        token = authorization[7:].strip()
    else:
        token = authorization.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token cannot be empty.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_response = await supabase.auth.get_user(token)
        user = getattr(user_response, "user", None)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id = str(user.id)
    email = getattr(user, "email", "")

    # Retrieve role and profile data from profiles table
    role = "buyer"
    profile_data: Dict[str, Any] = {}

    try:
        profile_res = (
            await supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .execute()
        )
        if profile_res.data and len(profile_res.data) > 0:
            profile_data = profile_res.data[0]
            role = profile_data.get("role", "buyer")
        else:
            # Fallback to user metadata if profile row has not yet synced
            user_metadata = getattr(user, "user_metadata", {}) or {}
            role = user_metadata.get("role", "buyer")
    except Exception:
        # Fallback to user metadata in case of database lookup failure
        user_metadata = getattr(user, "user_metadata", {}) or {}
        role = user_metadata.get("role", "buyer")

    return {
        "id": user_id,
        "email": email,
        "role": role,
        "profile": profile_data,
        "token": token,
    }


async def require_farmer(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Ensure authenticated user has the 'farmer' role."""
    if user.get("role") != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Farmer role required for this action.",
        )
    return user


async def require_buyer(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Ensure authenticated user has the 'buyer' role."""
    if user.get("role") != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Buyer role required for this action.",
        )
    return user
