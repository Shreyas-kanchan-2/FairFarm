/**
 * FairFarm TypeScript Definitions
 * Currency: INR (₹)
 */

export type UserRole = 'farmer' | 'buyer' | 'admin';
export type BusinessType = 'retailer' | 'hotel' | 'restaurant' | 'wholesaler' | 'individual';
export type ProduceCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'spices' | 'pulses' | 'oilseeds';
export type ListingStatus = 'active' | 'sold_out' | 'expired';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type OrderStatus = 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
export type TransportStatus = 'open' | 'matched' | 'completed';
export type Language = 'en' | 'hi' | 'kn';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  business_name?: string;
  business_type?: BusinessType;
  location?: string;
  latitude?: number;
  longitude?: number;
  preferred_language?: Language;
  created_at?: string;
}

export interface ProduceListing {
  id: string;
  farmer_id: string;
  farmer?: UserProfile;
  produce_name: string;
  category: ProduceCategory;
  description?: string;
  quantity_kg: number;
  available_quantity_kg: number;
  price_per_kg: number;
  unit: string;
  harvest_date?: string;
  best_before?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  is_organic: boolean;
  status: ListingStatus;
  created_at: string;
  updated_at?: string;
}

export interface Offer {
  id: string;
  listing_id: string;
  listing?: ProduceListing;
  buyer_id: string;
  buyer?: UserProfile;
  offered_price_per_kg: number;
  quantity_kg: number;
  pickup_or_delivery: 'pickup' | 'delivery';
  delivery_location?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  estimated_transport_cost?: number;
  estimated_loss_percent?: number;
  message?: string;
  status: OfferStatus;
  created_at: string;
  updated_at?: string;
}

export interface NetProfitResult {
  offer_id: string;
  gross_revenue: number;
  transport_cost: number;
  loss_cost: number;
  handling_cost: number;
  net_profit: number;
  rank: number;
  explanation: string;
}

export interface Order {
  id: string;
  offer_id: string;
  listing_id: string;
  listing?: ProduceListing;
  farmer_id: string;
  farmer?: UserProfile;
  buyer_id: string;
  buyer?: UserProfile;
  quantity_kg: number;
  agreed_price_per_kg: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface TransportRequest {
  id: string;
  farmer_id: string;
  farmer?: UserProfile;
  listing_id?: string;
  origin_location: string;
  origin_lat: number;
  origin_lng: number;
  destination_location: string;
  destination_lat: number;
  destination_lng: number;
  quantity_kg: number;
  preferred_date: string;
  status: TransportStatus;
  created_at: string;
}

export interface TransportMatch {
  match_id: string;
  farmer_id: string;
  farmer_name: string;
  origin_location: string;
  destination_location: string;
  quantity_kg: number;
  preferred_date: string;
  origin_distance_km: number;
  dest_distance_km: number;
  match_score: number;
}

export interface MandiPrice {
  id: string;
  commodity: string;
  variety: string;
  category: ProduceCategory;
  state: string;
  district: string;
  market_name: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  daily_change_percent: number;
  arrivals_quintal: number;
  arrival_date: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PriceForecastPoint {
  day_offset: number;
  date_label: string;
  predicted_price: number;
  confidence_low: number;
  confidence_high: number;
}

export interface PriceForecast {
  commodity: string;
  variety: string;
  region: string;
  current_price: number;
  forecast_7d: number;
  forecast_15d: number;
  forecast_30d: number;
  forecast_60d: number;
  confidence_score: number;
  peak_window: string;
  expected_trend: 'bullish' | 'bearish' | 'stable';
  seasonal_drivers: string[];
  farmer_advisory: string;
  buyer_advisory: string;
  trend_points: PriceForecastPoint[];
}

export interface PriceChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

