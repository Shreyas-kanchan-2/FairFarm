"""Authentication and User Profile router for FairFarm.

Handles user registration, login, profile retrieval, and profile updates.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from supabase._async.client import AsyncClient

from app.dependencies import get_current_user, get_supabase
from app.models.schemas import ProfileUpdate, UserLoginRequest, UserRegisterRequest

router = APIRouter()


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new farmer or buyer account",
)
async def register(
    req: UserRegisterRequest,
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Register a new user account with Supabase Auth.

    Automatically triggers profile creation in the database via PostgreSQL trigger.
    Additional business and location fields are persisted to the profiles table.
    """
    metadata = {
        "role": req.role,
        "full_name": req.full_name,
        "phone": req.phone,
        "preferred_language": req.preferred_language or "en",
        "business_name": req.business_name,
        "business_type": req.business_type,
        "location": req.location,
        "latitude": req.latitude,
        "longitude": req.longitude,
    }

    try:
        auth_response = await supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": metadata,
            },
        })
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(exc)}",
        ) from exc

    user = getattr(auth_response, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to register user. Please check your credentials.",
        )

    user_id = str(user.id)

    # Persist any extra profile fields directly to public.profiles table
    profile_extra_payload = {
        "business_name": req.business_name,
        "business_type": req.business_type,
        "location": req.location,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "phone": req.phone,
        "preferred_language": req.preferred_language or "en",
    }
    # Filter out None values
    clean_extra = {k: v for k, v in profile_extra_payload.items() if v is not None}
    if clean_extra:
        try:
            await (
                supabase.table("profiles")
                .update(clean_extra)
                .eq("id", user_id)
                .execute()
            )
        except Exception:
            # The trigger handle_new_user populates base fields; non-critical update failure is tolerated
            pass

    session = getattr(auth_response, "session", None)
    access_token = getattr(session, "access_token", None) if session else None

    return {
        "message": "User registered successfully.",
        "user_id": user_id,
        "email": req.email,
        "role": req.role,
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post(
    "/login",
    summary="Authenticate and login with email and password",
)
async def login(
    req: UserLoginRequest,
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Authenticate user credentials and return Supabase session JWT tokens."""
    try:
        auth_response = await supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid login credentials: {str(exc)}",
        ) from exc

    user = getattr(auth_response, "user", None)
    session = getattr(auth_response, "session", None)

    if not user or not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Please verify your email and password.",
        )

    user_id = str(user.id)

    # Retrieve profile details
    profile_data = {}
    try:
        profile_res = (
            await supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .execute()
        )
        if profile_res.data:
            profile_data = profile_res.data[0]
    except Exception:
        pass

    return {
        "access_token": session.access_token,
        "refresh_token": getattr(session, "refresh_token", None),
        "token_type": "bearer",
        "expires_in": getattr(session, "expires_in", None),
        "user": {
            "id": user_id,
            "email": user.email,
            "role": profile_data.get("role", "buyer"),
        },
        "profile": profile_data,
    }


@router.get(
    "/me",
    summary="Get current user's profile",
)
async def get_my_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Fetch the active profile details for the authenticated user."""
    try:
        res = (
            await supabase.table("profiles")
            .select("*")
            .eq("id", current_user["id"])
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )
        return res.data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(exc)}",
        ) from exc


@router.put(
    "/me",
    summary="Update current user's profile",
)
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: AsyncClient = Depends(get_supabase),
) -> Dict[str, Any]:
    """Update profile attributes for the authenticated user."""
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        # Return existing profile unchanged
        res = (
            await supabase.table("profiles")
            .select("*")
            .eq("id", current_user["id"])
            .single()
            .execute()
        )
        return res.data

    try:
        res = (
            await supabase.table("profiles")
            .update(update_data)
            .eq("id", current_user["id"])
            .execute()
        )
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found or update failed.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(exc)}",
        ) from exc
