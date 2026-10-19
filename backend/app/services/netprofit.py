"""NetProfit Match Service.

Calculates realistic net revenue for farmers after accounting for:
- Transport logistics costs (zero if buyer pickup; ₹8/km/100kg if delivery)
- Perishability / transit loss percentage (category-specific)
- Platform & handling charges (2% of gross revenue)
"""

from typing import Any, Dict, List, Union
from app.models.schemas import NetProfitResult
from app.services.transport_matcher import haversine_distance

# Default perishable transit loss percentages across categories
DEFAULT_LOSS_BY_CATEGORY: Dict[str, float] = {
    "vegetables": 5.0,
    "fruits": 4.0,
    "grains": 1.0,
    "dairy": 6.0,
    "spices": 1.0,
    "pulses": 1.5,
    "oilseeds": 1.0,
}

# Standard transport tariff in INR: ₹8 per km per 100kg
TRANSPORT_RATE_PER_KM_PER_100KG = 8.0
HANDLING_FEE_RATE = 0.02  # 2% platform handling fee


def _get_val(obj: Any, key: str, default: Any = None) -> Any:
    """Extract value from either a dictionary or an object attribute."""
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def estimate_transport_cost(
    listing: Union[Dict[str, Any], Any],
    offer: Union[Dict[str, Any], Any],
    quantity_kg: float,
) -> float:
    """Estimate transport cost based on distance between farm and delivery point.

    Tariff: ₹8 per km per 100 kg cargo weight.
    """
    farm_lat = _get_val(listing, "latitude")
    farm_lng = _get_val(listing, "longitude")
    deliv_lat = _get_val(offer, "delivery_latitude")
    deliv_lng = _get_val(offer, "delivery_longitude")

    if (
        farm_lat is not None
        and farm_lng is not None
        and deliv_lat is not None
        and deliv_lng is not None
    ):
        dist_km = haversine_distance(
            float(farm_lat), float(farm_lng), float(deliv_lat), float(deliv_lng)
        )
        # Cost = dist_km * (quantity_kg / 100.0) * rate
        cost = dist_km * (quantity_kg / 100.0) * TRANSPORT_RATE_PER_KM_PER_100KG
        return round(cost, 2)

    return 0.0


def calculate_net_profit(
    offers: List[Union[Dict[str, Any], Any]],
    listing: Union[Dict[str, Any], Any],
) -> List[NetProfitResult]:
    """Calculate NetProfit for all submitted offers on a produce listing.

    Ranks offers in descending order of net profit in Indian Rupees (₹).
    Generates an explanation for each offer explaining why it ranked where it did.
    """
    if not offers:
        return []

    category = str(_get_val(listing, "category", "")).lower()
    default_cat_loss = DEFAULT_LOSS_BY_CATEGORY.get(category, 2.0)

    evaluated_offers = []

    for offer in offers:
        offer_id = str(_get_val(offer, "id", ""))
        price_per_kg = float(_get_val(offer, "offered_price_per_kg", 0.0))
        qty_kg = float(_get_val(offer, "quantity_kg", 0.0))

        gross_revenue = round(price_per_kg * qty_kg, 2)

        # 1. Transport cost calculation
        pickup_or_delivery = str(
            _get_val(offer, "pickup_or_delivery", "pickup")
        ).lower()
        if pickup_or_delivery == "pickup":
            transport_cost = 0.0
            transport_note = "Buyer picks up from farm (₹0 transport cost)"
        else:
            provided_transport_cost = _get_val(offer, "estimated_transport_cost")
            if (
                provided_transport_cost is not None
                and float(provided_transport_cost) > 0
            ):
                transport_cost = round(float(provided_transport_cost), 2)
                transport_note = f"Delivery with quoted transport cost of ₹{transport_cost:,.2f}"
            else:
                transport_cost = estimate_transport_cost(listing, offer, qty_kg)
                transport_note = (
                    f"Delivery with estimated transport cost of ₹{transport_cost:,.2f} "
                    f"(based on ₹{TRANSPORT_RATE_PER_KM_PER_100KG}/km/100kg)"
                )

        # 2. Perishability Loss cost calculation
        loss_pct_val = _get_val(offer, "estimated_loss_percent")
        if loss_pct_val is not None and float(loss_pct_val) >= 0:
            loss_percent = float(loss_pct_val)
        else:
            loss_percent = default_cat_loss

        loss_cost = round((loss_percent / 100.0) * gross_revenue, 2)

        # 3. Platform handling fee (2% of gross)
        handling_cost = round(HANDLING_FEE_RATE * gross_revenue, 2)

        # 4. Net profit
        net_profit = round(
            gross_revenue - transport_cost - loss_cost - handling_cost, 2
        )

        evaluated_offers.append({
            "offer_id": offer_id,
            "gross_revenue": gross_revenue,
            "transport_cost": transport_cost,
            "loss_cost": loss_cost,
            "handling_cost": handling_cost,
            "net_profit": net_profit,
            "price_per_kg": price_per_kg,
            "quantity_kg": qty_kg,
            "pickup_or_delivery": pickup_or_delivery,
            "transport_note": transport_note,
            "loss_percent": loss_percent,
        })

    # Sort descending by net profit, then gross revenue
    evaluated_offers.sort(
        key=lambda x: (x["net_profit"], x["gross_revenue"]),
        reverse=True,
    )

    top_net_profit = evaluated_offers[0]["net_profit"] if evaluated_offers else 0.0
    results: List[NetProfitResult] = []

    for idx, item in enumerate(evaluated_offers):
        rank = idx + 1
        np_val = item["net_profit"]
        gross = item["gross_revenue"]
        tc = item["transport_cost"]
        lc = item["loss_cost"]
        hc = item["handling_cost"]
        p_kg = item["price_per_kg"]
        q_kg = item["quantity_kg"]
        loss_pct = item["loss_percent"]
        t_note = item["transport_note"]

        if rank == 1:
            explanation = (
                f"Rank #1: Best net return yielding ₹{np_val:,.2f} net profit from ₹{gross:,.2f} gross revenue "
                f"(₹{p_kg:,.2f}/kg for {q_kg:,.1f} kg). {t_note}. "
                f"Expected perishability loss is ₹{lc:,.2f} ({loss_pct}%), and platform fee is ₹{hc:,.2f} (2%)."
            )
        else:
            diff = top_net_profit - np_val
            explanation = (
                f"Rank #{rank}: Yields ₹{np_val:,.2f} net profit (₹{diff:,.2f} lower than #1). "
                f"Gross: ₹{gross:,.2f} (₹{p_kg:,.2f}/kg for {q_kg:,.1f} kg). "
                f"{t_note}. Deductions: ₹{tc:,.2f} transport + ₹{lc:,.2f} loss ({loss_pct}%) + ₹{hc:,.2f} handling (2%)."
            )

        results.append(
            NetProfitResult(
                offer_id=item["offer_id"],
                gross_revenue=gross,
                transport_cost=tc,
                loss_cost=lc,
                handling_cost=hc,
                net_profit=np_val,
                rank=rank,
                explanation=explanation,
            )
        )

    return results
