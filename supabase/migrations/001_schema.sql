-- FairFarm Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer')),
    full_name TEXT NOT NULL,
    phone TEXT,
    business_name TEXT,
    business_type TEXT CHECK (business_type IN ('retailer', 'hotel', 'restaurant', 'wholesaler', NULL)),
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'kn')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 2. PRODUCE LISTINGS TABLE
-- Farmers list their produce for buyers to discover
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produce_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    produce_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('vegetables', 'fruits', 'grains', 'dairy', 'spices', 'pulses', 'oilseeds')),
    description TEXT,
    quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    available_quantity_kg NUMERIC(10,2) NOT NULL CHECK (available_quantity_kg >= 0),
    price_per_kg NUMERIC(10,2) NOT NULL CHECK (price_per_kg > 0),
    unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'quintal', 'dozen', 'piece', 'litre')),
    harvest_date DATE,
    best_before DATE,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    is_organic BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. OFFERS TABLE
-- Buyers submit purchase offers on produce listings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_price_per_kg NUMERIC(10,2) NOT NULL CHECK (offered_price_per_kg > 0),
    quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    pickup_or_delivery TEXT DEFAULT 'pickup' CHECK (pickup_or_delivery IN ('pickup', 'delivery')),
    delivery_location TEXT,
    delivery_latitude DOUBLE PRECISION,
    delivery_longitude DOUBLE PRECISION,
    estimated_transport_cost NUMERIC(10,2) DEFAULT 0,
    estimated_loss_percent NUMERIC(5,2) DEFAULT 2.0 CHECK (estimated_loss_percent >= 0 AND estimated_loss_percent <= 100),
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 4. ORDERS TABLE
-- Created when a farmer accepts an offer
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE RESTRICT,
    listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(10,2) NOT NULL,
    agreed_price_per_kg NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_transit', 'delivered', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 5. TRANSPORT REQUESTS TABLE
-- Farmers request shared transport for deliveries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transport_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.produce_listings(id) ON DELETE SET NULL,
    origin_location TEXT NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    destination_location TEXT NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    preferred_date DATE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 6. INDEXES for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_produce_farmer ON public.produce_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_produce_category ON public.produce_listings(category);
CREATE INDEX IF NOT EXISTS idx_produce_status ON public.produce_listings(status);
CREATE INDEX IF NOT EXISTS idx_produce_location ON public.produce_listings(location);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON public.offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transport_farmer ON public.transport_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transport_status ON public.transport_requests(status);
CREATE INDEX IF NOT EXISTS idx_transport_date ON public.transport_requests(preferred_date);

-- ============================================================
-- 7. AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_produce_updated_at
    BEFORE UPDATE ON public.produce_listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. AUTO-CREATE PROFILE ON AUTH SIGNUP
-- Creates a profile row when a new user signs up via Supabase Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, phone, preferred_language)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
