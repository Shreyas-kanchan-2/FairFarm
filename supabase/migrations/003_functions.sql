-- FairFarm Database Functions
-- Run this AFTER 002_rls_policies.sql

-- ============================================================
-- ACCEPT OFFER AND CREATE ORDER (Atomic Transaction)
-- Prevents overselling by atomically:
--   1. Checking available quantity
--   2. Accepting the offer
--   3. Rejecting all other pending offers on the same listing
--      (only those that can no longer be fulfilled)
--   4. Creating the order
--   5. Decrementing available_quantity_kg
--   6. Marking listing as sold_out if quantity reaches 0
-- ============================================================
CREATE OR REPLACE FUNCTION public.accept_offer_and_create_order(
    p_offer_id UUID,
    p_farmer_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_offer RECORD;
    v_listing RECORD;
    v_order_id UUID;
    v_total_amount NUMERIC(12,2);
    v_new_available NUMERIC(10,2);
BEGIN
    -- Lock the offer row
    SELECT * INTO v_offer
    FROM public.offers
    WHERE id = p_offer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Offer not found';
    END IF;

    IF v_offer.status != 'pending' THEN
        RAISE EXCEPTION 'Offer is no longer pending (current status: %)', v_offer.status;
    END IF;

    -- Lock the listing row
    SELECT * INTO v_listing
    FROM public.produce_listings
    WHERE id = v_offer.listing_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found';
    END IF;

    -- Verify the farmer owns this listing
    IF v_listing.farmer_id != p_farmer_id THEN
        RAISE EXCEPTION 'You do not own this listing';
    END IF;

    -- Check available quantity
    IF v_listing.available_quantity_kg < v_offer.quantity_kg THEN
        RAISE EXCEPTION 'Insufficient quantity available. Requested: % kg, Available: % kg',
            v_offer.quantity_kg, v_listing.available_quantity_kg;
    END IF;

    -- Calculate total amount
    v_total_amount := v_offer.offered_price_per_kg * v_offer.quantity_kg;

    -- 1. Accept the offer
    UPDATE public.offers
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_offer_id;

    -- 2. Calculate new available quantity
    v_new_available := v_listing.available_quantity_kg - v_offer.quantity_kg;

    -- 3. Update listing quantity
    UPDATE public.produce_listings
    SET
        available_quantity_kg = v_new_available,
        status = CASE WHEN v_new_available <= 0 THEN 'sold_out' ELSE 'active' END,
        updated_at = NOW()
    WHERE id = v_listing.id;

    -- 4. Reject pending offers that can no longer be fulfilled
    UPDATE public.offers
    SET status = 'rejected', updated_at = NOW()
    WHERE listing_id = v_listing.id
      AND id != p_offer_id
      AND status = 'pending'
      AND quantity_kg > v_new_available;

    -- 5. Create the order
    INSERT INTO public.orders (
        offer_id, listing_id, farmer_id, buyer_id,
        quantity_kg, agreed_price_per_kg, total_amount, status
    ) VALUES (
        p_offer_id, v_listing.id, p_farmer_id, v_offer.buyer_id,
        v_offer.quantity_kg, v_offer.offered_price_per_kg, v_total_amount, 'confirmed'
    )
    RETURNING id INTO v_order_id;

    -- Return the result
    RETURN json_build_object(
        'order_id', v_order_id,
        'offer_id', p_offer_id,
        'listing_id', v_listing.id,
        'quantity_kg', v_offer.quantity_kg,
        'agreed_price_per_kg', v_offer.offered_price_per_kg,
        'total_amount', v_total_amount,
        'remaining_quantity_kg', v_new_available
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CALCULATE DISTANCE (Haversine Formula)
-- Returns distance in kilometers between two lat/lng points
-- ============================================================
CREATE OR REPLACE FUNCTION public.haversine_distance(
    lat1 DOUBLE PRECISION,
    lng1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371.0; -- Earth radius in km
    dlat DOUBLE PRECISION;
    dlng DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlng := RADIANS(lng2 - lng1);
    a := SIN(dlat / 2) * SIN(dlat / 2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dlng / 2) * SIN(dlng / 2);
    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- FIND TRANSPORT MATCHES
-- Returns nearby transport requests within a given radius
-- that share similar routes and dates
-- ============================================================
CREATE OR REPLACE FUNCTION public.find_transport_matches(
    p_request_id UUID,
    p_max_origin_distance_km DOUBLE PRECISION DEFAULT 25.0,
    p_max_dest_distance_km DOUBLE PRECISION DEFAULT 30.0,
    p_date_range_days INTEGER DEFAULT 2
)
RETURNS TABLE (
    match_id UUID,
    farmer_id UUID,
    farmer_name TEXT,
    origin_location TEXT,
    destination_location TEXT,
    quantity_kg NUMERIC,
    preferred_date DATE,
    origin_distance_km DOUBLE PRECISION,
    dest_distance_km DOUBLE PRECISION,
    match_score DOUBLE PRECISION
) AS $$
DECLARE
    v_request RECORD;
BEGIN
    SELECT * INTO v_request
    FROM public.transport_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transport request not found';
    END IF;

    RETURN QUERY
    SELECT
        tr.id AS match_id,
        tr.farmer_id,
        p.full_name AS farmer_name,
        tr.origin_location,
        tr.destination_location,
        tr.quantity_kg,
        tr.preferred_date,
        public.haversine_distance(v_request.origin_lat, v_request.origin_lng, tr.origin_lat, tr.origin_lng) AS origin_distance_km,
        public.haversine_distance(v_request.destination_lat, v_request.destination_lng, tr.destination_lat, tr.destination_lng) AS dest_distance_km,
        -- Match score: lower is better (weighted sum of origin distance, dest distance, date diff)
        (
            public.haversine_distance(v_request.origin_lat, v_request.origin_lng, tr.origin_lat, tr.origin_lng) * 1.0 +
            public.haversine_distance(v_request.destination_lat, v_request.destination_lng, tr.destination_lat, tr.destination_lng) * 1.0 +
            ABS(tr.preferred_date - v_request.preferred_date) * 10.0
        ) AS match_score
    FROM public.transport_requests tr
    JOIN public.profiles p ON p.id = tr.farmer_id
    WHERE tr.id != p_request_id
      AND tr.status = 'open'
      AND tr.farmer_id != v_request.farmer_id
      AND public.haversine_distance(v_request.origin_lat, v_request.origin_lng, tr.origin_lat, tr.origin_lng) <= p_max_origin_distance_km
      AND public.haversine_distance(v_request.destination_lat, v_request.destination_lng, tr.destination_lat, tr.destination_lng) <= p_max_dest_distance_km
      AND ABS(tr.preferred_date - v_request.preferred_date) <= p_date_range_days
    ORDER BY match_score ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
