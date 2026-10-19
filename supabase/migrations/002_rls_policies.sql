-- FairFarm Row Level Security Policies
-- Run this AFTER 001_schema.sql

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Anyone authenticated can read any profile (needed for showing farmer/buyer names)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Profile insert is handled by the trigger, but allow manual insert for own id
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================
-- PRODUCE LISTINGS POLICIES
-- ============================================================

-- Anyone (including anonymous) can view active listings
CREATE POLICY "Active listings are viewable by everyone"
ON public.produce_listings FOR SELECT
TO authenticated, anon
USING (
    status = 'active'
    OR (auth.uid() IS NOT NULL AND auth.uid() = farmer_id)
);

-- Only farmers can create listings (must be their own farmer_id)
CREATE POLICY "Farmers can create their own listings"
ON public.produce_listings FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'farmer'
    )
);

-- Farmers can update only their own listings
CREATE POLICY "Farmers can update own listings"
ON public.produce_listings FOR UPDATE
TO authenticated
USING (auth.uid() = farmer_id)
WITH CHECK (auth.uid() = farmer_id);

-- Farmers can delete only their own listings
CREATE POLICY "Farmers can delete own listings"
ON public.produce_listings FOR DELETE
TO authenticated
USING (auth.uid() = farmer_id);

-- ============================================================
-- OFFERS POLICIES
-- ============================================================

-- Buyers can see their own offers
CREATE POLICY "Buyers can view their own offers"
ON public.offers FOR SELECT
TO authenticated
USING (
    auth.uid() = buyer_id
);

-- Farmers can see offers on their listings
CREATE POLICY "Farmers can view offers on their listings"
ON public.offers FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.produce_listings
        WHERE id = listing_id AND farmer_id = auth.uid()
    )
);

-- Buyers can create offers (must match their own buyer_id)
CREATE POLICY "Buyers can create offers"
ON public.offers FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'buyer'
    )
);

-- Buyers can update (withdraw) their own offers
CREATE POLICY "Buyers can update own offers"
ON public.offers FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

-- Farmers can update (accept/reject) offers on their listings
CREATE POLICY "Farmers can update offers on their listings"
ON public.offers FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.produce_listings
        WHERE id = listing_id AND farmer_id = auth.uid()
    )
);

-- ============================================================
-- ORDERS POLICIES
-- ============================================================

-- Both farmer and buyer involved can view the order
CREATE POLICY "Order participants can view orders"
ON public.orders FOR SELECT
TO authenticated
USING (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
);

-- Orders are created by the system (service role) on offer acceptance
-- Allow farmers to insert orders for their own accepted offers
CREATE POLICY "System can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = farmer_id);

-- Farmers can update order status
CREATE POLICY "Farmers can update order status"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.uid() = farmer_id)
WITH CHECK (auth.uid() = farmer_id);

-- Buyers can update order status (e.g., mark as received)
CREATE POLICY "Buyers can update order status"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

-- ============================================================
-- TRANSPORT REQUESTS POLICIES
-- ============================================================

-- All authenticated users can view open transport requests (for matching)
CREATE POLICY "Open transport requests are viewable"
ON public.transport_requests FOR SELECT
TO authenticated
USING (
    status = 'open' OR farmer_id = auth.uid()
);

-- Farmers can create transport requests
CREATE POLICY "Farmers can create transport requests"
ON public.transport_requests FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'farmer'
    )
);

-- Farmers can update their own transport requests
CREATE POLICY "Farmers can update own transport requests"
ON public.transport_requests FOR UPDATE
TO authenticated
USING (auth.uid() = farmer_id)
WITH CHECK (auth.uid() = farmer_id);

-- Farmers can delete their own transport requests
CREATE POLICY "Farmers can delete own transport requests"
ON public.transport_requests FOR DELETE
TO authenticated
USING (auth.uid() = farmer_id);
