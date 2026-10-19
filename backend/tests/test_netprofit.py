"""Unit tests for NetProfit Match calculation engine."""

import pytest
from app.services.netprofit import (
    calculate_net_profit,
    estimate_transport_cost,
    DEFAULT_LOSS_BY_CATEGORY,
    HANDLING_FEE_RATE,
)


def test_empty_offers_returns_empty():
    """Empty offers list returns empty results."""
    listing = {"id": "1", "category": "vegetables"}
    assert calculate_net_profit([], listing) == []


def test_netprofit_ranking_reveals_real_winner(sample_listing, sample_offers):
    """Core NetProfit value proposition:

    Offer 2 has higher gross price (₹38/kg vs ₹34/kg), but requires expensive
    delivery to Mumbai with higher perishability loss.
    Offer 1 (farm-gate pickup at ₹34/kg) nets higher profit because of ₹0 transport!
    """
    results = calculate_net_profit(sample_offers, sample_listing)

    assert len(results) == 3

    # Results are sorted by net_profit descending
    assert results[0].rank == 1
    assert results[1].rank == 2
    assert results[2].rank == 3
    assert results[0].net_profit >= results[1].net_profit >= results[2].net_profit

    # Check Offer 1 math
    # Gross = 34 * 300 = ₹10,200
    # Transport = ₹0 (pickup)
    # Loss = 1.5% of 10,200 = ₹153
    # Handling = 2% of 10,200 = ₹204
    # Net = 10200 - 0 - 153 - 204 = ₹9,843
    offer1_res = next(r for r in results if r.offer_id == "offer-1")
    assert offer1_res.gross_revenue == 10200.0
    assert offer1_res.transport_cost == 0.0
    assert offer1_res.loss_cost == 153.0
    assert offer1_res.handling_cost == 204.0
    assert offer1_res.net_profit == 9843.0

    # Check Offer 2 math
    # Gross = 38 * 300 = ₹11,400 (Nominally higher!)
    # Transport = ₹2,800 (Provided)
    # Loss = 7.0% of 11,400 = ₹798
    # Handling = 2% of 11,400 = ₹228
    # Net = 11400 - 2800 - 798 - 228 = ₹7,574 (Much worse!)
    offer2_res = next(r for r in results if r.offer_id == "offer-2")
    assert offer2_res.gross_revenue == 11400.0
    assert offer2_res.transport_cost == 2800.0
    assert offer2_res.net_profit == 7574.0

    # Offer 1 must be ranked higher than Offer 2
    assert offer1_res.rank < offer2_res.rank
    assert offer1_res.net_profit > offer2_res.net_profit

    # Explanations generated with INR symbol
    assert "₹" in offer1_res.explanation
    assert "Rank #1" in offer1_res.explanation
    assert "₹" in offer2_res.explanation


def test_category_default_loss_applied_when_not_specified():
    """Category default loss is applied when offer doesn't specify loss percent."""
    listing = {
        "id": "list-dairy",
        "category": "dairy",
        "latitude": 18.5,
        "longitude": 73.8,
    }
    offers = [
        {
            "id": "off-milk",
            "offered_price_per_kg": 60.0,
            "quantity_kg": 100.0,
            "pickup_or_delivery": "pickup",
            "estimated_loss_percent": None,  # should use dairy default (6.0%)
        }
    ]
    results = calculate_net_profit(offers, listing)
    # Gross = 6,000; Loss = 6% of 6,000 = 360; Handling = 2% of 6,000 = 120; Net = 5520
    assert results[0].gross_revenue == 6000.0
    assert results[0].loss_cost == 360.0
    assert results[0].handling_cost == 120.0
    assert results[0].net_profit == 5520.0


def test_transport_distance_estimation():
    """Distance based transport estimation works when coordinates are present."""
    listing = {"latitude": 18.5204, "longitude": 73.8567}  # Pune center
    offer = {"delivery_latitude": 18.6279, "delivery_longitude": 73.8478}  # Bhosari (~12km)
    cost = estimate_transport_cost(listing, offer, quantity_kg=500.0)
    assert cost > 0.0
