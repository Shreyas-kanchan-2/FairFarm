import { describe, it, expect } from 'vitest';
import { calculateNetProfitLocal, haversineDistance } from '../api/client';
import { ProduceListing, Offer } from '../types';

describe('FairFarm Frontend NetProfit Match Engine', () => {
  const mockListing: ProduceListing = {
    id: 'prod-test',
    farmer_id: 'farmer-101',
    produce_name: 'Vine Tomatoes',
    category: 'vegetables',
    quantity_kg: 500,
    available_quantity_kg: 500,
    price_per_kg: 35,
    unit: 'kg',
    status: 'active',
    created_at: new Date().toISOString(),
    is_organic: true,
    latitude: 19.1235,
    longitude: 73.9782,
  };

  it('ranks farm-gate pickup offer higher when delivery costs erode higher nominal price', () => {
    const offers: Offer[] = [
      {
        id: 'offer-nominal-high',
        listing_id: 'prod-test',
        buyer_id: 'buyer-far',
        offered_price_per_kg: 38, // High nominal rate!
        quantity_kg: 300,
        pickup_or_delivery: 'delivery',
        delivery_location: 'Distant APMC (100km)',
        estimated_transport_cost: 2500,
        estimated_loss_percent: 7.0,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 'offer-pickup',
        listing_id: 'prod-test',
        buyer_id: 'buyer-local',
        offered_price_per_kg: 34, // Lower nominal rate!
        quantity_kg: 300,
        pickup_or_delivery: 'pickup',
        estimated_transport_cost: 0,
        estimated_loss_percent: 1.5,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];

    const results = calculateNetProfitLocal(offers, mockListing);

    expect(results).toHaveLength(2);
    // Pickup offer must be Rank #1
    expect(results[0].rank).toBe(1);
    expect(results[0].offer_id).toBe('offer-pickup');
    expect(results[0].net_profit).toBeGreaterThan(results[1].net_profit);

    // Verify INR symbol and explanation formatting
    expect(results[0].explanation).toContain('Rank #1');
    expect(results[0].explanation).toContain('₹');
  });

  it('calculates accurate Haversine spatial distances in km', () => {
    // Mumbai (18.9401, 72.8347) to Pune (18.5284, 73.8744)
    const dist = haversineDistance(18.9401, 72.8347, 18.5284, 73.8744);
    expect(dist).toBeGreaterThan(115);
    expect(dist).toBeLessThan(140);
  });
});
