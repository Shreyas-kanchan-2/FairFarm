"""Pytest fixtures for FairFarm backend tests."""

import pytest
from datetime import date, timedelta


@pytest.fixture
def sample_listing():
    """Sample produce listing in Pune, Maharashtra."""
    return {
        "id": "list-101",
        "farmer_id": "farmer-001",
        "produce_name": "Fresh Organic Tomatoes",
        "category": "vegetables",
        "description": "Farm-fresh ripe tomatoes, pesticide free",
        "quantity_kg": 500.0,
        "available_quantity_kg": 500.0,
        "price_per_kg": 35.0,
        "unit": "kg",
        "harvest_date": str(date.today()),
        "location": "Narayangaon, Pune",
        "latitude": 19.1235,
        "longitude": 73.9782,
        "is_organic": True,
        "status": "active",
    }


@pytest.fixture
def sample_offers():
    """Diverse offers on the sample listing for NetProfit evaluation."""
    return [
        {
            "id": "offer-1",
            "listing_id": "list-101",
            "buyer_id": "buyer-001",
            "offered_price_per_kg": 34.0,
            "quantity_kg": 300.0,
            "pickup_or_delivery": "pickup",  # Farm gate pickup (₹0 transport)
            "delivery_location": None,
            "delivery_latitude": None,
            "delivery_longitude": None,
            "estimated_transport_cost": 0.0,
            "estimated_loss_percent": 1.5,
            "status": "pending",
        },
        {
            "id": "offer-2",
            "listing_id": "list-101",
            "buyer_id": "buyer-002",
            "offered_price_per_kg": 38.0,  # Higher nominal price
            "quantity_kg": 300.0,
            "pickup_or_delivery": "delivery",  # But farmer must deliver to Mumbai (120km away)
            "delivery_location": "Vashi APMC, Navi Mumbai",
            "delivery_latitude": 19.0760,
            "delivery_longitude": 72.8777,
            "estimated_transport_cost": 2800.0,
            "estimated_loss_percent": 7.0,  # Higher loss during long transit
            "status": "pending",
        },
        {
            "id": "offer-3",
            "listing_id": "list-101",
            "buyer_id": "buyer-003",
            "offered_price_per_kg": 36.0,
            "quantity_kg": 200.0,
            "pickup_or_delivery": "delivery",
            "delivery_location": "Bhosari, Pune",  # Near delivery (30km)
            "delivery_latitude": 18.6279,
            "delivery_longitude": 73.8478,
            "estimated_transport_cost": 450.0,
            "estimated_loss_percent": 3.0,
            "status": "pending",
        },
    ]


@pytest.fixture
def sample_transport_requests():
    """Sample transport requests for shared transport pooling."""
    today = date.today()
    return {
        "base": {
            "id": "req-base",
            "farmer_id": "farmer-001",
            "origin_location": "Manchar, Pune",
            "origin_lat": 19.0063,
            "origin_lng": 73.9438,
            "destination_location": "Gultekdi Mandi, Pune",
            "destination_lat": 18.4967,
            "destination_lng": 73.8647,
            "quantity_kg": 400.0,
            "preferred_date": str(today + timedelta(days=1)),
            "status": "open",
        },
        "candidates": [
            {
                # Very close origin (Khed: ~15km), same destination, same date -> TOP MATCH
                "id": "req-candidate-1",
                "farmer_id": "farmer-002",
                "farmer_name": "Suresh Patil",
                "origin_location": "Rajgurunagar (Khed)",
                "origin_lat": 18.8550,
                "origin_lng": 73.9168,
                "destination_location": "Gultekdi Mandi, Pune",
                "destination_lat": 18.4967,
                "destination_lng": 73.8647,
                "quantity_kg": 350.0,
                "preferred_date": str(today + timedelta(days=1)),
                "status": "open",
            },
            {
                # Compatible origin (Narayangaon: ~20km), same destination, 1 day later
                "id": "req-candidate-2",
                "farmer_id": "farmer-003",
                "farmer_name": "Ramesh Pawar",
                "origin_location": "Narayangaon",
                "origin_lat": 19.1235,
                "origin_lng": 73.9782,
                "destination_location": "Market Yard, Pune",
                "destination_lat": 18.4930,
                "destination_lng": 73.8620,
                "quantity_kg": 500.0,
                "preferred_date": str(today + timedelta(days=2)),
                "status": "open",
            },
            {
                # Far origin (Nashik: >120km away) -> SHOULD BE EXCLUDED
                "id": "req-candidate-3",
                "farmer_id": "farmer-004",
                "farmer_name": "Ganesh Shinde",
                "origin_location": "Nashik",
                "origin_lat": 19.9975,
                "origin_lng": 73.7898,
                "destination_location": "Nashik Mandi",
                "destination_lat": 20.0050,
                "destination_lng": 73.7800,
                "quantity_kg": 600.0,
                "preferred_date": str(today + timedelta(days=1)),
                "status": "open",
            },
        ],
    }
