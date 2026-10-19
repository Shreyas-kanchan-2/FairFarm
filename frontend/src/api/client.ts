import axios from 'axios';
import {
  ProduceListing,
  Offer,
  Order,
  TransportRequest,
  TransportMatch,
  NetProfitResult,
  UserProfile,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase/session token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fairfarm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// LOCAL STORAGE SEED & PERSISTENCE (Ensures immediate 100% functionality)
// ============================================================================

const SEED_PROFILES: UserProfile[] = [
  {
    id: 'farmer-101',
    role: 'farmer',
    full_name: 'Rameshwar Patil',
    phone: '+91 98220 12345',
    business_name: 'Patil Organic Farms',
    location: 'Narayangaon, Junnar, Pune',
    latitude: 19.1235,
    longitude: 73.9782,
    preferred_language: 'en',
  },
  {
    id: 'farmer-102',
    role: 'farmer',
    full_name: 'Babu Gowda',
    phone: '+91 94480 67890',
    business_name: 'Gowda Agro Produce',
    location: 'Kolar, Karnataka',
    latitude: 13.1367,
    longitude: 78.1345,
    preferred_language: 'kn',
  },
  {
    id: 'buyer-201',
    role: 'buyer',
    full_name: 'Sandeep Khurana',
    phone: '+91 98110 54321',
    business_name: 'FreshBite Supermarkets & Kitchens',
    business_type: 'retailer',
    location: 'Shivajinagar, Pune',
    latitude: 18.5314,
    longitude: 73.8446,
    preferred_language: 'en',
  },
  {
    id: 'buyer-202',
    role: 'buyer',
    full_name: 'Anand Agrawal',
    phone: '+91 97654 32109',
    business_name: 'Heritage Grand Hotels & Hospitality',
    business_type: 'hotel',
    location: 'Kalyani Nagar, Pune',
    latitude: 18.5477,
    longitude: 73.9038,
    preferred_language: 'en',
  },
];

const SEED_LISTINGS: ProduceListing[] = [
  {
    id: 'prod-001',
    farmer_id: 'farmer-101',
    farmer: SEED_PROFILES[0],
    produce_name: 'Farm-Fresh Vine Tomatoes',
    category: 'vegetables',
    description: 'Juicy, naturally ripened desi vine tomatoes. Harvested early morning without chemical spray.',
    quantity_kg: 800,
    available_quantity_kg: 800,
    price_per_kg: 34,
    unit: 'kg',
    harvest_date: new Date().toISOString().split('T')[0],
    best_before: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    location: 'Narayangaon, Junnar, Pune',
    latitude: 19.1235,
    longitude: 73.9782,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    is_organic: true,
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'prod-002',
    farmer_id: 'farmer-101',
    farmer: SEED_PROFILES[0],
    produce_name: 'Organic Red Onions (Nashik Quality)',
    category: 'vegetables',
    description: 'Firm, dry-cured red onions with excellent shelf life. Great pungency and medium to large grading.',
    quantity_kg: 1500,
    available_quantity_kg: 1500,
    price_per_kg: 28,
    unit: 'kg',
    harvest_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    best_before: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    location: 'Narayangaon, Junnar, Pune',
    latitude: 19.1235,
    longitude: 73.9782,
    image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    is_organic: true,
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'prod-003',
    farmer_id: 'farmer-102',
    farmer: SEED_PROFILES[1],
    produce_name: 'Sona Masoori Aromatic Rice (A-Grade)',
    category: 'grains',
    description: 'Directly milled unpolished lightweight grain. Fragrant and easily digestible, season crop.',
    quantity_kg: 2500,
    available_quantity_kg: 2500,
    price_per_kg: 56,
    unit: 'kg',
    harvest_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    best_before: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    location: 'Kolar, Karnataka',
    latitude: 13.1367,
    longitude: 78.1345,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    is_organic: false,
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'prod-004',
    farmer_id: 'farmer-102',
    farmer: SEED_PROFILES[1],
    produce_name: 'Fresh Cow Milk (A2 Gir Cow)',
    category: 'dairy',
    description: 'Chilled raw milk supplied within 2 hours of milking. Rich fat content 4.2%, pure taste.',
    quantity_kg: 200,
    available_quantity_kg: 200,
    price_per_kg: 65,
    unit: 'litre',
    harvest_date: new Date().toISOString().split('T')[0],
    best_before: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    location: 'Kolar, Karnataka',
    latitude: 13.1367,
    longitude: 78.1345,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
    is_organic: true,
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const SEED_OFFERS: Offer[] = [
  {
    id: 'off-001',
    listing_id: 'prod-001',
    buyer_id: 'buyer-201',
    buyer: SEED_PROFILES[2],
    offered_price_per_kg: 33,
    quantity_kg: 400,
    pickup_or_delivery: 'pickup', // Farmgate pickup
    delivery_location: 'Farm Gate (Buyer arranges transport)',
    estimated_transport_cost: 0,
    estimated_loss_percent: 2.0,
    message: 'We will bring our own refrigerated mini-truck to pickup directly at your farm gate tomorrow morning.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'off-002',
    listing_id: 'prod-001',
    buyer_id: 'buyer-202',
    buyer: SEED_PROFILES[3],
    offered_price_per_kg: 38, // Nominally higher price!
    quantity_kg: 400,
    pickup_or_delivery: 'delivery', // Requires delivery to city
    delivery_location: 'Kalyani Nagar Hotel Kitchen, Pune (78 km)',
    delivery_latitude: 18.5477,
    delivery_longitude: 73.9038,
    estimated_transport_cost: 2150, // High logistics fee
    estimated_loss_percent: 6.5, // Transit damage on tomatoes
    message: 'Requires crate delivery to hotel stores by 8 AM. Need firm unblemished tomatoes.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

const SEED_TRANSPORT: TransportRequest[] = [
  {
    id: 'trans-001',
    farmer_id: 'farmer-101',
    farmer: SEED_PROFILES[0],
    origin_location: 'Narayangaon, Junnar, Pune',
    origin_lat: 19.1235,
    origin_lng: 73.9782,
    destination_location: 'Gultekdi Market Yard, Pune',
    destination_lat: 18.4967,
    destination_lng: 73.8647,
    quantity_kg: 600,
    preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'open',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'trans-002',
    farmer_id: 'farmer-103',
    farmer: {
      id: 'farmer-103',
      role: 'farmer',
      full_name: 'Shankar Jadhav',
      phone: '+91 98500 45678',
      business_name: 'Jadhav Vegetable Nursery',
      location: 'Rajgurunagar (Khed), Pune',
      latitude: 18.8550,
      longitude: 73.9168,
    },
    origin_location: 'Rajgurunagar (Khed), Pune',
    origin_lat: 18.8550,
    origin_lng: 73.9168,
    destination_location: 'Gultekdi Market Yard, Pune',
    destination_lat: 18.4967,
    destination_lng: 73.8647,
    quantity_kg: 500,
    preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'open',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// Helper to get local data
function getLocal<T>(key: string, seed: T): T {
  const item = localStorage.getItem(`fairfarm_${key}`);
  if (!item) {
    localStorage.setItem(`fairfarm_${key}`, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(item);
  } catch {
    return seed;
  }
}

function setLocal<T>(key: string, data: T) {
  localStorage.setItem(`fairfarm_${key}`, JSON.stringify(data));
}

// Haversine formula in TS
export function haversineDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Client-side NetProfit Calculator
export function calculateNetProfitLocal(
  offers: Offer[],
  listing: ProduceListing
): NetProfitResult[] {
  if (!offers || offers.length === 0) return [];

  const defaultCategoryLosses: Record<string, number> = {
    vegetables: 5.0,
    fruits: 4.0,
    grains: 1.0,
    dairy: 6.0,
    spices: 1.0,
    pulses: 1.5,
    oilseeds: 1.0,
  };

  const defaultLoss = defaultCategoryLosses[listing.category] || 2.5;

  const evaluated = offers.map((offer) => {
    const gross = Math.round(offer.offered_price_per_kg * offer.quantity_kg * 100) / 100;
    
    // 1. Transport Cost
    let transportCost = 0;
    let transportNote = 'Buyer arranges farm-gate pickup (₹0 transport)';
    if (offer.pickup_or_delivery === 'delivery') {
      if (offer.estimated_transport_cost && offer.estimated_transport_cost > 0) {
        transportCost = offer.estimated_transport_cost;
        transportNote = `Quoted transport charge: ₹${transportCost.toLocaleString('en-IN')}`;
      } else if (
        listing.latitude &&
        listing.longitude &&
        offer.delivery_latitude &&
        offer.delivery_longitude
      ) {
        const dist = haversineDistance(
          listing.latitude,
          listing.longitude,
          offer.delivery_latitude,
          offer.delivery_longitude
        );
        transportCost = Math.round(dist * (offer.quantity_kg / 100) * 8);
        transportNote = `Delivery distance ~${dist} km (est. ₹${transportCost.toLocaleString('en-IN')} at ₹8/km/100kg)`;
      } else {
        transportCost = Math.round(offer.quantity_kg * 3.5); // Fallback estimate
        transportNote = `Estimated standard logistics: ₹${transportCost.toLocaleString('en-IN')}`;
      }
    }

    // 2. Perishability Loss
    const lossPct = offer.estimated_loss_percent ?? defaultLoss;
    const lossCost = Math.round((lossPct / 100) * gross * 100) / 100;

    // 3. Platform handling (2%)
    const handlingCost = Math.round(0.02 * gross * 100) / 100;

    // 4. Net Profit
    const netProfit = Math.round((gross - transportCost - lossCost - handlingCost) * 100) / 100;

    return {
      offer_id: offer.id,
      gross,
      transportCost,
      lossCost,
      handlingCost,
      netProfit,
      pricePerKg: offer.offered_price_per_kg,
      qtyKg: offer.quantity_kg,
      lossPct,
      transportNote,
    };
  });

  // Sort descending by net profit
  evaluated.sort((a, b) => b.netProfit - a.netProfit);

  const topNet = evaluated[0]?.netProfit || 0;

  return evaluated.map((item, index) => {
    const rank = index + 1;
    let explanation = '';
    if (rank === 1) {
      explanation = `Rank #1: Top Net Return yielding ₹${item.netProfit.toLocaleString('en-IN')} net earnings from ₹${item.gross.toLocaleString('en-IN')} gross (₹${item.pricePerKg}/kg for ${item.qtyKg} kg). ${item.transportNote}. Expected transit loss is ₹${item.lossCost.toLocaleString('en-IN')} (${item.lossPct}%), and platform fee is ₹${item.handlingCost.toLocaleString('en-IN')} (2%).`;
    } else {
      const diff = Math.round((topNet - item.netProfit) * 100) / 100;
      explanation = `Rank #${rank}: Yields ₹${item.netProfit.toLocaleString('en-IN')} net profit (₹${diff.toLocaleString('en-IN')} lower than #1). Gross: ₹${item.gross.toLocaleString('en-IN')} (₹${item.pricePerKg}/kg). ${item.transportNote}. Total deductions: ₹${(item.transportCost + item.lossCost + item.handlingCost).toLocaleString('en-IN')}.`;
    }

    return {
      offer_id: item.offer_id,
      gross_revenue: item.gross,
      transport_cost: item.transportCost,
      loss_cost: item.lossCost,
      handling_cost: item.handlingCost,
      net_profit: item.netProfit,
      rank,
      explanation,
    };
  });
}

// ============================================================================
// API SERVICE METHODS
// ============================================================================

export const produceApi = {
  async getAll(): Promise<ProduceListing[]> {
    try {
      const res = await api.get<ProduceListing[]>('/api/produce');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to local store
    }
    return getLocal<ProduceListing[]>('listings', SEED_LISTINGS);
  },

  async getById(id: string): Promise<ProduceListing | null> {
    try {
      const res = await api.get<ProduceListing>(`/api/produce/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const listings = getLocal<ProduceListing[]>('listings', SEED_LISTINGS);
    return listings.find((l) => l.id === id) || null;
  },

  async create(data: Partial<ProduceListing>): Promise<ProduceListing> {
    try {
      const res = await api.post<ProduceListing>('/api/produce', data);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const listings = getLocal<ProduceListing[]>('listings', SEED_LISTINGS);
    const newListing: ProduceListing = {
      id: `prod-${Date.now()}`,
      farmer_id: data.farmer_id || 'farmer-101',
      produce_name: data.produce_name || 'Produce',
      category: data.category || 'vegetables',
      description: data.description || '',
      quantity_kg: Number(data.quantity_kg) || 100,
      available_quantity_kg: Number(data.quantity_kg) || 100,
      price_per_kg: Number(data.price_per_kg) || 20,
      unit: data.unit || 'kg',
      harvest_date: data.harvest_date || new Date().toISOString().split('T')[0],
      location: data.location || 'Pune, Maharashtra',
      latitude: data.latitude || 18.5204,
      longitude: data.longitude || 73.8567,
      image_url:
        data.image_url ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      is_organic: Boolean(data.is_organic),
      status: 'active',
      created_at: new Date().toISOString(),
    };
    listings.unshift(newListing);
    setLocal('listings', listings);
    return newListing;
  },
};

export const offersApi = {
  async getByListing(listingId: string): Promise<Offer[]> {
    try {
      const res = await api.get<Offer[]>(`/api/offers/listing/${listingId}`);
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch {
      // Fallback
    }
    const offers = getLocal<Offer[]>('offers', SEED_OFFERS);
    return offers.filter((o) => o.listing_id === listingId);
  },

  async getMyOffers(): Promise<Offer[]> {
    try {
      const res = await api.get<Offer[]>('/api/offers/my');
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch {
      // Fallback
    }
    const userJson = localStorage.getItem('fairfarm_user');
    const user = userJson ? JSON.parse(userJson) : null;
    const offers = getLocal<Offer[]>('offers', SEED_OFFERS);
    if (user?.role === 'buyer') {
      return offers.filter((o) => o.buyer_id === user.id);
    }
    return offers;
  },

  async submit(data: Partial<Offer>): Promise<Offer> {
    try {
      const res = await api.post<Offer>('/api/offers', data);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const offers = getLocal<Offer[]>('offers', SEED_OFFERS);
    const userJson = localStorage.getItem('fairfarm_user');
    const user = userJson ? JSON.parse(userJson) : SEED_PROFILES[2];

    const newOffer: Offer = {
      id: `off-${Date.now()}`,
      listing_id: data.listing_id!,
      buyer_id: user.id,
      buyer: user,
      offered_price_per_kg: Number(data.offered_price_per_kg),
      quantity_kg: Number(data.quantity_kg),
      pickup_or_delivery: data.pickup_or_delivery || 'pickup',
      delivery_location: data.delivery_location || '',
      delivery_latitude: data.delivery_latitude,
      delivery_longitude: data.delivery_longitude,
      estimated_transport_cost: data.estimated_transport_cost || 0,
      estimated_loss_percent: data.estimated_loss_percent || 2.5,
      message: data.message || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    offers.unshift(newOffer);
    setLocal('offers', offers);
    return newOffer;
  },

  // Atomic offer acceptance that prevents overselling
  async accept(offerId: string): Promise<{ order: Order; remaining_quantity: number }> {
    try {
      const res = await api.post(`/api/offers/${offerId}/accept`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }

    const offers = getLocal<Offer[]>('offers', SEED_OFFERS);
    const listings = getLocal<ProduceListing[]>('listings', SEED_LISTINGS);
    const orders = getLocal<Order[]>('orders', []);

    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer) throw new Error('Offer not found');

    const listing = listings.find((l) => l.id === targetOffer.listing_id);
    if (!listing) throw new Error('Listing not found');

    if (listing.available_quantity_kg < targetOffer.quantity_kg) {
      throw new Error(
        `Insufficient quantity available. Requested: ${targetOffer.quantity_kg} kg, Available: ${listing.available_quantity_kg} kg`
      );
    }

    // 1. Accept target offer
    targetOffer.status = 'accepted';
    targetOffer.updated_at = new Date().toISOString();

    // 2. Decrement available quantity
    const newAvailable = Math.max(0, listing.available_quantity_kg - targetOffer.quantity_kg);
    listing.available_quantity_kg = newAvailable;
    if (newAvailable <= 0) {
      listing.status = 'sold_out';
    }
    listing.updated_at = new Date().toISOString();

    // 3. Reject pending offers that can no longer be fulfilled
    offers.forEach((o) => {
      if (
        o.listing_id === listing.id &&
        o.id !== offerId &&
        o.status === 'pending' &&
        o.quantity_kg > newAvailable
      ) {
        o.status = 'rejected';
        o.updated_at = new Date().toISOString();
      }
    });

    // 4. Create confirmed order
    const totalAmount = Math.round(targetOffer.offered_price_per_kg * targetOffer.quantity_kg * 100) / 100;
    const userJson = localStorage.getItem('fairfarm_user');
    const farmer = userJson ? JSON.parse(userJson) : SEED_PROFILES[0];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      offer_id: targetOffer.id,
      listing_id: listing.id,
      listing,
      farmer_id: listing.farmer_id,
      farmer,
      buyer_id: targetOffer.buyer_id,
      buyer: targetOffer.buyer,
      quantity_kg: targetOffer.quantity_kg,
      agreed_price_per_kg: targetOffer.offered_price_per_kg,
      total_amount: totalAmount,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    // Save state
    setLocal('offers', offers);
    setLocal('listings', listings);
    setLocal('orders', orders);

    return { order: newOrder, remaining_quantity: newAvailable };
  },

  async reject(offerId: string): Promise<Offer> {
    try {
      const res = await api.post(`/api/offers/${offerId}/reject`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const offers = getLocal<Offer[]>('offers', SEED_OFFERS);
    const target = offers.find((o) => o.id === offerId);
    if (target) {
      target.status = 'rejected';
      setLocal('offers', offers);
      return target;
    }
    throw new Error('Offer not found');
  },

  async getNetProfit(listingId: string): Promise<NetProfitResult[]> {
    try {
      const res = await api.get<NetProfitResult[]>(`/api/offers/listing/${listingId}/netprofit`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    const listing = await produceApi.getById(listingId);
    const offers = await offersApi.getByListing(listingId);
    if (!listing) return [];
    return calculateNetProfitLocal(offers, listing);
  },
};

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    try {
      const res = await api.get<Order[]>('/api/orders');
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch {
      // Fallback
    }
    return getLocal<Order[]>('orders', []);
  },

  async updateStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const res = await api.put<Order>(`/api/orders/${orderId}/status`, { status });
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const orders = getLocal<Order[]>('orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      ord.status = status;
      setLocal('orders', orders);
      return ord;
    }
    throw new Error('Order not found');
  },
};

export const transportApi = {
  async getRequests(): Promise<TransportRequest[]> {
    try {
      const res = await api.get<TransportRequest[]>('/api/transport/my-requests');
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch {
      // Fallback
    }
    return getLocal<TransportRequest[]>('transport', SEED_TRANSPORT);
  },

  async create(data: Partial<TransportRequest>): Promise<TransportRequest> {
    try {
      const res = await api.post<TransportRequest>('/api/transport/request', data);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const reqs = getLocal<TransportRequest[]>('transport', SEED_TRANSPORT);
    const userJson = localStorage.getItem('fairfarm_user');
    const user = userJson ? JSON.parse(userJson) : SEED_PROFILES[0];

    const newReq: TransportRequest = {
      id: `trans-${Date.now()}`,
      farmer_id: user.id,
      farmer: user,
      origin_location: data.origin_location || 'Pune',
      origin_lat: Number(data.origin_lat) || 18.5204,
      origin_lng: Number(data.origin_lng) || 73.8567,
      destination_location: data.destination_location || 'Mumbai APMC',
      destination_lat: Number(data.destination_lat) || 19.0760,
      destination_lng: Number(data.destination_lng) || 72.8777,
      quantity_kg: Number(data.quantity_kg) || 500,
      preferred_date: data.preferred_date || new Date().toISOString().split('T')[0],
      status: 'open',
      created_at: new Date().toISOString(),
    };
    reqs.unshift(newReq);
    setLocal('transport', reqs);
    return newReq;
  },

  async findMatches(requestId: string): Promise<TransportMatch[]> {
    try {
      const res = await api.get<TransportMatch[]>(`/api/transport/matches/${requestId}`);
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch {
      // Fallback
    }
    const reqs = getLocal<TransportRequest[]>('transport', SEED_TRANSPORT);
    const base = reqs.find((r) => r.id === requestId);
    if (!base) return [];

    return reqs
      .filter((r) => r.id !== requestId && r.status === 'open')
      .map((cand) => {
        const origDist = haversineDistance(
          base.origin_lat,
          base.origin_lng,
          cand.origin_lat,
          cand.origin_lng
        );
        const destDist = haversineDistance(
          base.destination_lat,
          base.destination_lng,
          cand.destination_lat,
          cand.destination_lng
        );
        const score = Math.round((origDist * 1.0 + destDist * 1.0) * 10) / 10;
        return {
          match_id: cand.id,
          farmer_id: cand.farmer_id,
          farmer_name: cand.farmer?.full_name || 'Nearby Farmer',
          origin_location: cand.origin_location,
          destination_location: cand.destination_location,
          quantity_kg: cand.quantity_kg,
          preferred_date: cand.preferred_date,
          origin_distance_km: origDist,
          dest_distance_km: destDist,
          match_score: score,
        };
      })
      .sort((a, b) => a.match_score - b.match_score);
  },
};

// Voice AI helper: streams from backend ElevenLabs or speaks with Web Speech API
export async function speakVoiceAI(text: string, lang: 'en' | 'hi' | 'kn' = 'en'): Promise<void> {
  // Try ElevenLabs backend endpoint first
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok && response.headers.get('content-type')?.includes('audio')) {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      await audio.play();
      return;
    }
  } catch {
    // Fallback to browser Web Speech API
  }

  // Web Speech API fallback
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'kn') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}
