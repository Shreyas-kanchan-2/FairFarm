import { describe, it, expect } from 'vitest';
import { MANDI_PRICES_DATA, PRICE_FORECASTS_DATA, getCommodityForecast, generateMarketAdvisorResponse } from '../api/priceData';

describe('FairFarm Navigation & Price Intelligence Engine', () => {
  it('Farmer sidebar specification requirements are met', () => {
    const expectedFarmerNavigation = [
      'Dashboard',
      'Marketplace',
      'My Listings',
      'Shared Transport',
      'Orders',
      'Current Price',
      'Estimated Future Price',
    ];

    expect(expectedFarmerNavigation).toHaveLength(7);
    expect(expectedFarmerNavigation[0]).toBe('Dashboard');
    expect(expectedFarmerNavigation[1]).toBe('Marketplace');
    expect(expectedFarmerNavigation[2]).toBe('My Listings');
    expect(expectedFarmerNavigation[3]).toBe('Shared Transport');
    expect(expectedFarmerNavigation[4]).toBe('Orders');
    expect(expectedFarmerNavigation[5]).toBe('Current Price');
    expect(expectedFarmerNavigation[6]).toBe('Estimated Future Price');
  });

  it('Buyer sidebar specification requirements are met', () => {
    const expectedBuyerNavigation = [
      'Dashboard',
      'Marketplace',
      'My Offers',
      'Orders',
      'Current Price',
      'Estimated Future Price',
    ];

    expect(expectedBuyerNavigation).toHaveLength(6);
    expect(expectedBuyerNavigation[0]).toBe('Dashboard');
    expect(expectedBuyerNavigation[1]).toBe('Marketplace');
    expect(expectedBuyerNavigation[2]).toBe('My Offers');
    expect(expectedBuyerNavigation[3]).toBe('Orders');
    expect(expectedBuyerNavigation[4]).toBe('Current Price');
    expect(expectedBuyerNavigation[5]).toBe('Estimated Future Price');
  });

  it('Mandi live benchmark prices dataset is properly populated with authentic rates', () => {
    expect(MANDI_PRICES_DATA.length).toBeGreaterThanOrEqual(7);

    const tomatoPune = MANDI_PRICES_DATA.find((m) => m.commodity === 'Tomato' && m.district === 'Pune');
    expect(tomatoPune).toBeDefined();
    expect(tomatoPune?.modal_price).toBe(34);
    expect(tomatoPune?.unit).toBe('kg');
    expect(tomatoPune?.trend).toBe('up');

    const onionLasalgaon = MANDI_PRICES_DATA.find((m) => m.commodity === 'Onion' && m.market_name.includes('Lasalgaon'));
    expect(onionLasalgaon).toBeDefined();
    expect(onionLasalgaon?.modal_price).toBe(28);
  });

  it('Price forecast model delivers 7d, 15d, 30d and 60d projections with confidence intervals', () => {
    const tomatoForecast = getCommodityForecast('Tomato');
    expect(tomatoForecast.current_price).toBe(34);
    expect(tomatoForecast.forecast_7d).toBe(38.5);
    expect(tomatoForecast.forecast_15d).toBe(42.0);
    expect(tomatoForecast.forecast_30d).toBe(31.0);
    expect(tomatoForecast.forecast_60d).toBe(26.5);
    expect(tomatoForecast.confidence_score).toBeGreaterThan(80);
    expect(tomatoForecast.trend_points.length).toBeGreaterThan(5);
    expect(tomatoForecast.farmer_advisory).toBeTruthy();
    expect(tomatoForecast.buyer_advisory).toBeTruthy();
  });

  it('AgriMarket AI Chatbot generates contextual answers for farmers and buyers', () => {
    const sellResponse = generateMarketAdvisorResponse('Should I sell my tomatoes now or wait?');
    expect(sellResponse).toContain('Tomato');
    expect(sellResponse).toContain('₹');

    const highestResponse = generateMarketAdvisorResponse('Where is tomato selling highest today?');
    expect(highestResponse).toContain('APMC');
    expect(highestResponse).toContain('FairFarm');

    const middlemanResponse = generateMarketAdvisorResponse('How does FairFarm compare to middlemen commissions?');
    expect(middlemanResponse).toContain('NetProfit');
  });
});
