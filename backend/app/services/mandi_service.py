"""Service for fetching live mandi prices from data.gov.in (e-NAM / OGD)."""

import logging
import time
import requests
from app.config import MANDI_API_URL, settings

logger = logging.getLogger(__name__)

_CACHE: dict[str, tuple[float, list[dict]]] = {}
_TTL_SECONDS = 3600  # 1 hour cache


def _title_case(value: str | None) -> str | None:
    """Normalize a filter value to Title Case for data.gov.in compatibility.

    The OGD API uses Title Case for state, district, and commodity fields
    (e.g. 'Tomato', 'Karnataka', 'Bengaluru'). This ensures user queries
    like 'tomato' or 'KARNATAKA' match correctly.
    """
    if not value or not value.strip():
        return None
    return value.strip().title()


def fetch_mandi_prices(
    state: str | None = None,
    district: str | None = None,
    commodity: str | None = None,
    limit: int = 50,
) -> list[dict]:
    """Fetch live mandi prices from data.gov.in with caching and graceful fallback.

    Returns a list of price records, or an empty list if the API is
    unreachable, times out, or returns no data.
    """
    # Normalize inputs to Title Case for OGD API compatibility
    state = _title_case(state)
    district = _title_case(district)
    commodity = _title_case(commodity)

    cache_key = f"{state or ''}|{district or ''}|{commodity or ''}|{limit}"
    now = time.time()

    if cache_key in _CACHE:
        cached_at, cached_rows = _CACHE[cache_key]
        if now - cached_at < _TTL_SECONDS:
            return cached_rows

    api_key = (settings.DATA_GOV_API_KEY or "").strip()
    if not api_key:
        logger.warning("DATA_GOV_API_KEY is missing in .env — returning empty results")
        return []

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": limit,
    }
    if state:
        params["filters[state]"] = state
    if district:
        params["filters[district]"] = district
    if commodity:
        params["filters[commodity]"] = commodity

    try:
        response = requests.get(MANDI_API_URL, params=params, timeout=20)
        response.raise_for_status()
        raw_records = response.json().get("records", [])
    except requests.Timeout:
        logger.warning("data.gov.in mandi API timed out after 20s — returning empty results")
        return []
    except requests.ConnectionError:
        logger.warning("data.gov.in mandi API connection failed — returning empty results")
        return []
    except requests.HTTPError as exc:
        logger.warning("data.gov.in mandi API HTTP error %s — returning empty results", exc)
        return []
    except Exception as exc:
        logger.warning("Unexpected error fetching mandi prices: %s — returning empty results", exc)
        return []

    if not raw_records:
        logger.info("data.gov.in returned 0 records for query: state=%s, commodity=%s", state, commodity)
        return []

    formatted = []
    for row in raw_records:
        min_q = float(row.get("min_price") or 0)
        max_q = float(row.get("max_price") or 0)
        modal_q = float(row.get("modal_price") or 0)

        formatted.append({
            "state": row.get("state"),
            "district": row.get("district"),
            "market": row.get("market"),
            "commodity": row.get("commodity"),
            "variety": row.get("variety"),
            "grade": row.get("grade"),
            "arrival_date": row.get("arrival_date"),
            "min_price_quintal": min_q,
            "max_price_quintal": max_q,
            "modal_price_quintal": modal_q,
            "modal_price_per_kg": round(modal_q / 100, 2) if modal_q else 0,
        })

    _CACHE[cache_key] = (now, formatted)
    return formatted