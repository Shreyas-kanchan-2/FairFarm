"""Transport matching service with haversine distance calculation.

Mirrors the PostgreSQL haversine_distance and find_transport_matches functions.
"""

from datetime import date, datetime
import math
from typing import Any, Dict, List, Optional, Union


def haversine_distance(
    lat1: Optional[float],
    lng1: Optional[float],
    lat2: Optional[float],
    lng2: Optional[float],
) -> float:
    """Calculate great-circle distance in kilometers between two GPS points.

    Uses the Earth radius R = 6371.0 km, matching the database SQL function.
    Returns 0.0 if coordinates are invalid or missing.
    """
    if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
        return 0.0

    # If coordinates are identical
    if lat1 == lat2 and lng1 == lng2:
        return 0.0

    r = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)

    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2.0) ** 2
    )

    # Clamp a to [0, 1] to prevent domain errors in sqrt due to floating point inaccuracy
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 4)


def calculate_match_score(
    origin_distance_km: float,
    dest_distance_km: float,
    date_diff_days: int,
) -> float:
    """Calculate match composite score.

    Lower score indicates a closer and better aligned shared transport route.
    Weights: 1.0 per origin km + 1.0 per destination km + 10.0 per day discrepancy.
    """
    return round(
        (origin_distance_km * 1.0)
        + (dest_distance_km * 1.0)
        + (abs(date_diff_days) * 10.0),
        4,
    )


def _to_date(val: Union[str, date, datetime]) -> date:
    """Convert string or datetime to date object."""
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        return datetime.fromisoformat(val.replace("Z", "+00:00")).date()
    raise ValueError(f"Cannot convert {val} of type {type(val)} to date")


def match_transport_requests(
    base_request: Dict[str, Any],
    candidate_requests: List[Dict[str, Any]],
    max_origin_distance_km: float = 25.0,
    max_dest_distance_km: float = 30.0,
    date_range_days: int = 2,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """Match candidates against a base transport request in Python.

    Used when PostgreSQL RPC is unavailable or in service layer testing.
    """
    base_id = str(base_request.get("id"))
    base_farmer_id = str(base_request.get("farmer_id"))
    base_origin_lat = float(base_request["origin_lat"])
    base_origin_lng = float(base_request["origin_lng"])
    base_dest_lat = float(base_request["destination_lat"])
    base_dest_lng = float(base_request["destination_lng"])
    base_date = _to_date(base_request["preferred_date"])

    matches = []

    for candidate in candidate_requests:
        candidate_id = str(candidate.get("id"))
        candidate_farmer_id = str(candidate.get("farmer_id"))

        # Skip self and same farmer
        if candidate_id == base_id or candidate_farmer_id == base_farmer_id:
            continue

        # Check status is open
        if candidate.get("status") != "open":
            continue

        # Check date difference
        candidate_date = _to_date(candidate["preferred_date"])
        diff_days = abs((candidate_date - base_date).days)
        if diff_days > date_range_days:
            continue

        # Check origin distance
        c_orig_lat = float(candidate["origin_lat"])
        c_orig_lng = float(candidate["origin_lng"])
        orig_dist = haversine_distance(base_origin_lat, base_origin_lng, c_orig_lat, c_orig_lng)
        if orig_dist > max_origin_distance_km:
            continue

        # Check destination distance
        c_dest_lat = float(candidate["destination_lat"])
        c_dest_lng = float(candidate["destination_lng"])
        dest_dist = haversine_distance(base_dest_lat, base_dest_lng, c_dest_lat, c_dest_lng)
        if dest_dist > max_dest_distance_km:
            continue

        score = calculate_match_score(orig_dist, dest_dist, diff_days)

        farmer_info = candidate.get("farmer") or {}
        farmer_name = (
            candidate.get("farmer_name")
            or (farmer_info.get("full_name") if isinstance(farmer_info, dict) else None)
            or "Nearby Farmer"
        )

        matches.append({
            "match_id": candidate.get("id"),
            "farmer_id": candidate.get("farmer_id"),
            "farmer_name": farmer_name,
            "origin_location": candidate.get("origin_location"),
            "destination_location": candidate.get("destination_location"),
            "quantity_kg": float(candidate.get("quantity_kg", 0)),
            "preferred_date": candidate_date,
            "origin_distance_km": round(orig_dist, 2),
            "dest_distance_km": round(dest_dist, 2),
            "match_score": round(score, 2),
        })

    # Sort by match_score ascending (lower is better)
    matches.sort(key=lambda x: x["match_score"])
    return matches[:limit]
