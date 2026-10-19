"""Unit tests for shared transport matching logic and haversine calculations."""

import pytest
from app.services.transport_matcher import (
    haversine_distance,
    calculate_match_score,
    match_transport_requests,
)


def test_haversine_same_point():
    """Distance between identical points is 0."""
    assert haversine_distance(18.5204, 73.8567, 18.5204, 73.8567) == 0.0


def test_haversine_known_distance():
    """Mumbai to Pune distance is approximately 120-150 km."""
    # Mumbai CST: 18.9401, 72.8347; Pune Station: 18.5284, 73.8744
    dist = haversine_distance(18.9401, 72.8347, 18.5284, 73.8744)
    assert 115.0 <= dist <= 140.0


def test_haversine_missing_coords():
    """Distance returns 0.0 when coordinates are missing."""
    assert haversine_distance(None, 73.8567, 18.5204, 73.8567) == 0.0
    assert haversine_distance(18.5204, 73.8567, 18.5204, None) == 0.0


def test_calculate_match_score():
    """Score increases with distance and date discrepancy."""
    score1 = calculate_match_score(origin_distance_km=5.0, dest_distance_km=5.0, date_diff_days=0)
    score2 = calculate_match_score(origin_distance_km=15.0, dest_distance_km=5.0, date_diff_days=0)
    score3 = calculate_match_score(origin_distance_km=5.0, dest_distance_km=5.0, date_diff_days=2)

    assert score1 < score2  # Closer origin has better score
    assert score1 < score3  # Closer date has better score


def test_match_transport_requests(sample_transport_requests):
    """Transport matcher filters candidates by radius and date, ranking top matches."""
    base = sample_transport_requests["base"]
    candidates = sample_transport_requests["candidates"]

    matches = match_transport_requests(
        base_request=base,
        candidate_requests=candidates,
        max_origin_distance_km=25.0,
        max_dest_distance_km=30.0,
        date_range_days=2,
    )

    # Candidate 3 (Nashik, >120km away) must be excluded
    matched_ids = [m["match_id"] for m in matches]
    assert "req-candidate-3" not in matched_ids

    # Candidate 1 and Candidate 2 should be matched
    assert "req-candidate-1" in matched_ids
    assert "req-candidate-2" in matched_ids

    # Candidate 1 is closer and on the same date, so it must rank first
    assert matches[0]["match_id"] == "req-candidate-1"
    assert matches[0]["origin_distance_km"] < 25.0
    assert matches[0]["dest_distance_km"] < 30.0
