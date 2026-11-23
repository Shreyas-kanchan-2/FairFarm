import { MandiPrice, PriceForecast } from '../types';

export const MANDI_PRICES_DATA: MandiPrice[] = [
  {
    id: 'mp-tomato-pune',
    commodity: 'Tomato',
    variety: 'Hybrid Tomato (Vaishnavi)',
    category: 'vegetables',
    state: 'Maharashtra',
    district: 'Pune',
    market_name: 'Pune APMC (Gultekdi)',
    min_price: 28,
    max_price: 38,
    modal_price: 34,
    unit: 'kg',
    daily_change_percent: 4.2,
    arrivals_quintal: 3420,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-tomato-kolar',
    commodity: 'Tomato',
    variety: 'Local Kolar Hybrid',
    category: 'vegetables',
    state: 'Karnataka',
    district: 'Kolar',
    market_name: 'Kolar APMC Mandi',
    min_price: 26,
    max_price: 36,
    modal_price: 32,
    unit: 'kg',
    daily_change_percent: 3.5,
    arrivals_quintal: 5120,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-tomato-nashik',
    commodity: 'Tomato',
    variety: 'Pimpalgaon Red',
    category: 'vegetables',
    state: 'Maharashtra',
    district: 'Nashik',
    market_name: 'Pimpalgaon Baswant APMC',
    min_price: 25,
    max_price: 35,
    modal_price: 31,
    unit: 'kg',
    daily_change_percent: 1.8,
    arrivals_quintal: 4200,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-onion-lasalgaon',
    commodity: 'Onion',
    variety: 'Red Onion (Garva)',
    category: 'vegetables',
    state: 'Maharashtra',
    district: 'Nashik',
    market_name: 'Lasalgaon APMC',
    min_price: 22,
    max_price: 32,
    modal_price: 28,
    unit: 'kg',
    daily_change_percent: 2.1,
    arrivals_quintal: 6800,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-onion-pune',
    commodity: 'Onion',
    variety: 'Local Red Onion',
    category: 'vegetables',
    state: 'Maharashtra',
    district: 'Pune',
    market_name: 'Pune APMC (Gultekdi)',
    min_price: 24,
    max_price: 33,
    modal_price: 29,
    unit: 'kg',
    daily_change_percent: 1.5,
    arrivals_quintal: 4600,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-potato-agra',
    commodity: 'Potato',
    variety: 'Kufri Jyoti / Chipsona',
    category: 'vegetables',
    state: 'Uttar Pradesh',
    district: 'Agra',
    market_name: 'Agra Mandi Hub',
    min_price: 17,
    max_price: 23,
    modal_price: 20,
    unit: 'kg',
    daily_change_percent: -1.2,
    arrivals_quintal: 8900,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'down',
  },
  {
    id: 'mp-potato-pune',
    commodity: 'Potato',
    variety: 'Manchar Pukhraj',
    category: 'vegetables',
    state: 'Maharashtra',
    district: 'Pune',
    market_name: 'Manchar APMC Mandi',
    min_price: 19,
    max_price: 25,
    modal_price: 22,
    unit: 'kg',
    daily_change_percent: -0.8,
    arrivals_quintal: 3100,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'down',
  },
  {
    id: 'mp-wheat-khanna',
    commodity: 'Wheat',
    variety: 'PBW 343 / Sharbati',
    category: 'grains',
    state: 'Punjab',
    district: 'Ludhiana',
    market_name: 'Khanna Grain Market',
    min_price: 27,
    max_price: 32,
    modal_price: 29.5,
    unit: 'kg',
    daily_change_percent: 0.9,
    arrivals_quintal: 5400,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'stable',
  },
  {
    id: 'mp-rice-karnal',
    commodity: 'Basmati Rice',
    variety: 'Pusa 1121 Raw',
    category: 'grains',
    state: 'Haryana',
    district: 'Karnal',
    market_name: 'Karnal Grain Mandi',
    min_price: 58,
    max_price: 72,
    modal_price: 64,
    unit: 'kg',
    daily_change_percent: 1.4,
    arrivals_quintal: 3100,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-chilli-byadagi',
    commodity: 'Green Chilli',
    variety: 'G-4 / Jwala',
    category: 'vegetables',
    state: 'Karnataka',
    district: 'Haveri',
    market_name: 'Byadagi APMC Mandi',
    min_price: 50,
    max_price: 68,
    modal_price: 60,
    unit: 'kg',
    daily_change_percent: 5.6,
    arrivals_quintal: 1450,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
  {
    id: 'mp-soybean-latur',
    commodity: 'Soybean',
    variety: 'Yellow Soy JS 335',
    category: 'oilseeds',
    state: 'Maharashtra',
    district: 'Latur',
    market_name: 'Latur APMC Mandi',
    min_price: 43,
    max_price: 49,
    modal_price: 46.5,
    unit: 'kg',
    daily_change_percent: -0.4,
    arrivals_quintal: 4120,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'stable',
  },
  {
    id: 'mp-ginger-shimoga',
    commodity: 'Ginger',
    variety: 'Green Fresh Ginger (Maran)',
    category: 'spices',
    state: 'Karnataka',
    district: 'Shimoga',
    market_name: 'Shimoga APMC',
    min_price: 74,
    max_price: 96,
    modal_price: 85,
    unit: 'kg',
    daily_change_percent: 3.2,
    arrivals_quintal: 870,
    arrival_date: new Date().toISOString().split('T')[0],
    trend: 'up',
  },
];

export const PRICE_FORECASTS_DATA: Record<string, PriceForecast> = {
  Tomato: {
    commodity: 'Tomato',
    variety: 'Hybrid Tomato',
    region: 'Western & Southern India',
    current_price: 34,
    forecast_7d: 38.5,
    forecast_15d: 42.0,
    forecast_30d: 31.0,
    forecast_60d: 26.5,
    confidence_score: 92,
    peak_window: 'Next 10–16 days',
    expected_trend: 'bullish',
    seasonal_drivers: [
      'Pre-monsoon transit disruptions and high summer heat reducing fruit setting in Kolar belt',
      'High restaurant and hospitality procurement ahead of weekend festival runs',
      'Fresh transplant harvest from Nashik plateau expected in 25–30 days, which will cool market prices',
    ],
    farmer_advisory:
      'Recommended Action: Harvest and dispatch current mature clusters over the next 10 to 14 days to lock in peak margins of ₹38–₹42/kg. Avoid delaying beyond Day 20 when northern inflows start dampening rates.',
    buyer_advisory:
      'Procurement Strategy: Procure essential inventory directly through FairFarm forward contracts now. Spot prices will be elevated for 2 weeks before easing back towards ₹30/kg in late month.',
    trend_points: [
      { day_offset: -14, date_label: '2 Wks Ago', predicted_price: 27.5, confidence_low: 26, confidence_high: 29 },
      { day_offset: -7, date_label: '1 Wk Ago', predicted_price: 30.0, confidence_low: 29, confidence_high: 31.5 },
      { day_offset: 0, date_label: 'Today', predicted_price: 34.0, confidence_low: 33, confidence_high: 35 },
      { day_offset: 7, date_label: '+7 Days', predicted_price: 38.5, confidence_low: 36, confidence_high: 41 },
      { day_offset: 15, date_label: '+15 Days (Peak)', predicted_price: 42.0, confidence_low: 39, confidence_high: 45 },
      { day_offset: 30, date_label: '+30 Days', predicted_price: 31.0, confidence_low: 28, confidence_high: 34 },
      { day_offset: 60, date_label: '+60 Days', predicted_price: 26.5, confidence_low: 23, confidence_high: 30 },
    ],
  },
  Onion: {
    commodity: 'Onion',
    variety: 'Red Onion (Nasik)',
    region: 'Maharashtra & Central Mandis',
    current_price: 28.5,
    forecast_7d: 29.5,
    forecast_15d: 32.0,
    forecast_30d: 27.0,
    forecast_60d: 24.0,
    confidence_score: 89,
    peak_window: 'Next 12–18 days',
    expected_trend: 'bullish',
    seasonal_drivers: [
      'Late Rabi storage stock drawing down with low transit sprouting',
      'Stable export minimum values supporting baseline wholesale rates',
      'Early Kharif arrivals scheduled to land across regional mandis starting late next month',
    ],
    farmer_advisory:
      'Recommended Action: Release well-cured storage onions in staggered lots across Days 10–18. Premium grade will fetch ₹30–₹33/kg directly from urban supermarket buyers.',
    buyer_advisory:
      'Procurement Strategy: Stagger spot buys and secure 15-day supply agreements on FairFarm to avoid open mandi brokerage surcharges.',
    trend_points: [
      { day_offset: -14, date_label: '2 Wks Ago', predicted_price: 25.0, confidence_low: 24, confidence_high: 26.5 },
      { day_offset: -7, date_label: '1 Wk Ago', predicted_price: 26.8, confidence_low: 25.5, confidence_high: 28 },
      { day_offset: 0, date_label: 'Today', predicted_price: 28.5, confidence_low: 27.5, confidence_high: 29.5 },
      { day_offset: 7, date_label: '+7 Days', predicted_price: 29.5, confidence_low: 28, confidence_high: 31.5 },
      { day_offset: 15, date_label: '+15 Days (Peak)', predicted_price: 32.0, confidence_low: 30, confidence_high: 34.5 },
      { day_offset: 30, date_label: '+30 Days', predicted_price: 27.0, confidence_low: 25, confidence_high: 29 },
      { day_offset: 60, date_label: '+60 Days', predicted_price: 24.0, confidence_low: 21, confidence_high: 27 },
    ],
  },
  Potato: {
    commodity: 'Potato',
    variety: 'Kufri Jyoti / Chipsona',
    region: 'North & Western Belts',
    current_price: 22.0,
    forecast_7d: 21.0,
    forecast_15d: 19.8,
    forecast_30d: 19.0,
    forecast_60d: 21.5,
    confidence_score: 94,
    peak_window: 'Gradual softening then steady in Day 45',
    expected_trend: 'bearish',
    seasonal_drivers: [
      'Cold storage capacity release at 92% across Agra, Aligarh, and Punjab warehouses',
      'High market supply volume absorbing demand from food processing units',
    ],
    farmer_advisory:
      'Recommended Action: Clear ready table potato inventory promptly. Take advantage of FairFarm Shared Transport to eliminate middleman unloading deductions.',
    buyer_advisory:
      'Procurement Strategy: Favorable buyer market with ample supply. Ideal period to negotiate bulk procurement for restaurants and chips manufacturers.',
    trend_points: [
      { day_offset: -14, date_label: '2 Wks Ago', predicted_price: 24.0, confidence_low: 23, confidence_high: 25 },
      { day_offset: -7, date_label: '1 Wk Ago', predicted_price: 23.2, confidence_low: 22, confidence_high: 24 },
      { day_offset: 0, date_label: 'Today', predicted_price: 22.0, confidence_low: 21, confidence_high: 23 },
      { day_offset: 7, date_label: '+7 Days', predicted_price: 21.0, confidence_low: 20, confidence_high: 22 },
      { day_offset: 15, date_label: '+15 Days', predicted_price: 19.8, confidence_low: 18.5, confidence_high: 21 },
      { day_offset: 30, date_label: '+30 Days', predicted_price: 19.0, confidence_low: 17.5, confidence_high: 20.5 },
      { day_offset: 60, date_label: '+60 Days', predicted_price: 21.5, confidence_low: 19.5, confidence_high: 23.5 },
    ],
  },
  Wheat: {
    commodity: 'Wheat',
    variety: 'Sharbati / Lokwan',
    region: 'Central & Northern Markets',
    current_price: 29.5,
    forecast_7d: 30.2,
    forecast_15d: 31.0,
    forecast_30d: 31.8,
    forecast_60d: 32.5,
    confidence_score: 93,
    peak_window: 'Steady upward trend',
    expected_trend: 'bullish',
    seasonal_drivers: [
      'Flour mills and packaged atta brands actively accumulating inventory',
      'Government procurement targets maintaining firm floor prices across mandis',
    ],
    farmer_advisory:
      'Recommended Action: Holding dry, well-aerated grain can yield 6–10% higher returns in 45–60 days.',
    buyer_advisory:
      'Procurement Strategy: Accumulate inventory at current ₹29–₹30/kg levels before further gradual appreciation.',
    trend_points: [
      { day_offset: -14, date_label: '2 Wks Ago', predicted_price: 28.5, confidence_low: 28, confidence_high: 29 },
      { day_offset: -7, date_label: '1 Wk Ago', predicted_price: 29.0, confidence_low: 28.5, confidence_high: 29.5 },
      { day_offset: 0, date_label: 'Today', predicted_price: 29.5, confidence_low: 29, confidence_high: 30 },
      { day_offset: 7, date_label: '+7 Days', predicted_price: 30.2, confidence_low: 29.5, confidence_high: 31 },
      { day_offset: 15, date_label: '+15 Days', predicted_price: 31.0, confidence_low: 30, confidence_high: 32 },
      { day_offset: 30, date_label: '+30 Days', predicted_price: 31.8, confidence_low: 30.5, confidence_high: 33 },
      { day_offset: 60, date_label: '+60 Days', predicted_price: 32.5, confidence_low: 31, confidence_high: 34 },
    ],
  },
  'Green Chilli': {
    commodity: 'Green Chilli',
    variety: 'G-4 / Jwala',
    region: 'Southern & Western Hubs',
    current_price: 60.0,
    forecast_7d: 64.5,
    forecast_15d: 68.0,
    forecast_30d: 55.0,
    forecast_60d: 48.0,
    confidence_score: 88,
    peak_window: 'Next 10–14 days',
    expected_trend: 'bullish',
    seasonal_drivers: [
      'Intense summer temperatures causing blossom drop in key cultivation belts',
      'Tight local arrivals with strong urban retail demand for fresh green pods',
    ],
    farmer_advisory:
      'Recommended Action: Stagger pickings twice a week to capture immediate ₹60–₹68/kg market rates.',
    buyer_advisory:
      'Procurement Strategy: Direct farmer dispatch reduces in-transit wilting and shrinkage by up to 12%.',
    trend_points: [
      { day_offset: -14, date_label: '2 Wks Ago', predicted_price: 52.0, confidence_low: 50, confidence_high: 54 },
      { day_offset: -7, date_label: '1 Wk Ago', predicted_price: 56.0, confidence_low: 54, confidence_high: 58 },
      { day_offset: 0, date_label: 'Today', predicted_price: 60.0, confidence_low: 58, confidence_high: 62 },
      { day_offset: 7, date_label: '+7 Days', predicted_price: 64.5, confidence_low: 61, confidence_high: 68 },
      { day_offset: 15, date_label: '+15 Days (Peak)', predicted_price: 68.0, confidence_low: 64, confidence_high: 73 },
      { day_offset: 30, date_label: '+30 Days', predicted_price: 55.0, confidence_low: 50, confidence_high: 60 },
      { day_offset: 60, date_label: '+60 Days', predicted_price: 48.0, confidence_low: 42, confidence_high: 54 },
    ],
  },
};

// Default fallback forecast generator for other commodities
export function getCommodityForecast(commodity: string): PriceForecast {
  if (PRICE_FORECASTS_DATA[commodity]) {
    return PRICE_FORECASTS_DATA[commodity];
  }

  // Find mandi benchmark
  const mandiItem = MANDI_PRICES_DATA.find(
    (m) => m.commodity.toLowerCase() === commodity.toLowerCase()
  );
  const base = mandiItem ? mandiItem.modal_price : 40;

  return {
    commodity,
    variety: mandiItem?.variety || 'Standard Quality',
    region: mandiItem?.state || 'National Benchmark',
    current_price: base,
    forecast_7d: Math.round(base * 1.05 * 10) / 10,
    forecast_15d: Math.round(base * 1.11 * 10) / 10,
    forecast_30d: Math.round(base * 1.02 * 10) / 10,
    forecast_60d: Math.round(base * 0.94 * 10) / 10,
    confidence_score: 87,
    peak_window: 'Next 10–18 days',
    expected_trend: 'bullish',
    seasonal_drivers: [
      'Seasonal market demand matching current mandi arrivals',
      'Weather conditions in major producing districts supporting price firmness',
    ],
    farmer_advisory: `Recommended Action: Sell high-quality lots within the next 15 days to capture projected ${Math.round(base * 1.11)} ₹/kg levels before broader regional harvest arrivals.`,
    buyer_advisory: `Procurement Strategy: Lock in supply contracts directly on FairFarm to bypass APMC middleman markups.`,
    trend_points: [
      { day_offset: -14, date_label: '2 Wks Ago', predicted_price: Math.round(base * 0.92 * 10) / 10, confidence_low: base * 0.88, confidence_high: base * 0.96 },
      { day_offset: -7, date_label: '1 Wk Ago', predicted_price: Math.round(base * 0.96 * 10) / 10, confidence_low: base * 0.92, confidence_high: base * 1.00 },
      { day_offset: 0, date_label: 'Today', predicted_price: base, confidence_low: base * 0.98, confidence_high: base * 1.02 },
      { day_offset: 7, date_label: '+7 Days', predicted_price: Math.round(base * 1.05 * 10) / 10, confidence_low: base * 1.01, confidence_high: base * 1.10 },
      { day_offset: 15, date_label: '+15 Days', predicted_price: Math.round(base * 1.11 * 10) / 10, confidence_low: base * 1.06, confidence_high: base * 1.17 },
      { day_offset: 30, date_label: '+30 Days', predicted_price: Math.round(base * 1.02 * 10) / 10, confidence_low: base * 0.96, confidence_high: base * 1.08 },
      { day_offset: 60, date_label: '+60 Days', predicted_price: Math.round(base * 0.94 * 10) / 10, confidence_low: base * 0.88, confidence_high: base * 1.01 },
    ],
  };
}

// Interactive AI Market Advisor Response Generator
export function generateMarketAdvisorResponse(
  prompt: string,
  context?: { commodity?: string; mandi?: string; role?: string }
): string {
  const p = prompt.toLowerCase();
  const targetCommodity = context?.commodity || 'Tomato';
  const forecast = getCommodityForecast(targetCommodity);

  if (p.includes('highest') || p.includes('where') || p.includes('best market') || p.includes('which mandi')) {
    const matching = MANDI_PRICES_DATA.filter(
      (m) => m.commodity.toLowerCase().includes(targetCommodity.toLowerCase())
    );
    if (matching.length > 0) {
      const top = [...matching].sort((a, b) => b.modal_price - a.modal_price)[0];
      return `For ${targetCommodity}, the highest current modal rate is at ${top.market_name} (${top.state}) at ₹${top.modal_price}/kg (ranging ₹${top.min_price} – ₹${top.max_price}/kg) with ${top.arrivals_quintal.toLocaleString('en-IN')} quintals daily arrival. Remember: When comparing with FairFarm direct sales, traditional mandis deduct 6-8% commission plus handling and in-transit wastage!`;
    }
  }

  if (/\b(sell|harvest|wait|hold|timing)\b/.test(p)) {
    return `Based on our AI prediction models for ${forecast.commodity} in ${forecast.region}, current price is ₹${forecast.current_price}/kg and projected to peak around ₹${forecast.forecast_15d}/kg during the ${forecast.peak_window}. ${forecast.farmer_advisory}`;
  }

  if (p.includes('future') || p.includes('forecast') || p.includes('next month') || p.includes('predict')) {
    return `AI Price Projection for ${forecast.commodity}: 7-Day: ₹${forecast.forecast_7d}/kg | 15-Day: ₹${forecast.forecast_15d}/kg | 30-Day: ₹${forecast.forecast_30d}/kg | 60-Day: ₹${forecast.forecast_60d}/kg. Confidence: ${forecast.confidence_score}%. Key driver: ${forecast.seasonal_drivers[0]}.`;
  }

  if (p.includes('buyer') || p.includes('buy') || p.includes('procure') || p.includes('order')) {
    return `For commercial buyers and retailers sourcing ${forecast.commodity}: ${forecast.buyer_advisory}`;
  }

  if (p.includes('fairfarm') || p.includes('middlemen') || p.includes('netprofit') || p.includes('commission')) {
    return `Open APMC mandis impose commission agents (arhatiyas) taking 6% to 8.5%, uncalibrated weighment deductions (1-2%), and transit damage (4-6%). With FairFarm, growers connect directly with buyers using automated NetProfit ranking and pooled shared transport, keeping up to 24% more earnings in the farmer's pocket!`;
  }

  return `Currently, ${forecast.commodity} is trading at ₹${forecast.current_price}/kg modal rate with an expected ${forecast.expected_trend} trend towards ₹${forecast.forecast_15d}/kg. Key seasonal factor: ${forecast.seasonal_drivers[0]}. Feel free to ask about specific mandis, harvest timing, or NetProfit comparisons!`;
}
