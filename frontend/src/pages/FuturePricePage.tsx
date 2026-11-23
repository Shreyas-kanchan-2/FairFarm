import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
  Send,
  AlertCircle,
  Clock,
  Compass,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { pricesApi } from '../api/client';
import { PriceForecast, PriceChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const FuturePricePage: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [forecast, setForecast] = useState<PriceForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Forecast Chatbot state
  const [chatMessages, setChatMessages] = useState<PriceChatMessage[]>([
    {
      id: 'msg-fore-welcome',
      sender: 'assistant',
      text: 'Namaste! I am the FairFarm AgriForecast AI Engine. Ask me about expected price peaks, seasonal monsoon impacts, or the optimal week to harvest and sell your crops.',
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  const commodities = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Green Chilli'];

  useEffect(() => {
    async function loadForecast() {
      setIsLoading(true);
      try {
        const data = await pricesApi.getForecast(selectedCommodity);
        setForecast(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadForecast();
  }, [selectedCommodity]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: PriceChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!queryText) setChatInput('');
    setIsBotThinking(true);

    try {
      const botReply = await pricesApi.askChatbot(textToSend, {
        commodity: selectedCommodity,
        role: role || 'farmer',
      });

      const assistantMsg: PriceChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Helper for SVG Chart calculation
  const points = forecast?.trend_points || [];
  const minVal = points.length > 0 ? Math.min(...points.map((p) => p.predicted_price)) * 0.9 : 20;
  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.predicted_price)) * 1.1 : 50;
  const chartHeight = 180;
  const chartWidth = 560;

  const getX = (idx: number) => 40 + (idx / (points.length - 1)) * (chartWidth - 80);
  const getY = (val: number) => chartHeight - 20 - ((val - minVal) / (maxVal - minVal)) * (chartHeight - 40);

  const polylineCoords = points.map((p, idx) => `${getX(idx)},${getY(p.predicted_price)}`).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 p-6 sm:p-8 text-cream-50 shadow-md border border-forest-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-700/80 px-3 py-1 text-xs font-semibold text-gold-300 mb-2 border border-forest-600">
              <Sparkles className="h-3 w-3" /> Machine Learning Agricultural Forecast Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Estimated Future Price Predictions
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-forest-200 max-w-2xl">
              Forward price curves for 7, 15, 30, and 60 days based on weather cycles, harvest inflows, historical mandi velocity, and cold-storage inventories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              to="/prices/current"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-cream-100 hover:bg-forest-700 transition border border-forest-700"
            >
              <TrendingUp className="h-4 w-4 text-gold-400" /> Current Mandi Rates
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-forest-950 hover:bg-gold-400 transition shadow-xs"
            >
              <ShoppingBag className="h-4 w-4" /> Go to Marketplace
            </Link>
          </div>
        </div>

        {/* Commodity Select Tabs */}
        <div className="mt-6 pt-6 border-t border-forest-700/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
          <span className="text-forest-300 font-semibold mr-1">Select Crop:</span>
          {commodities.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCommodity(crop)}
              className={`rounded-xl px-4 py-1.5 font-bold transition whitespace-nowrap ${
                selectedCommodity === crop
                  ? 'bg-gold-400 text-forest-950 shadow-xs'
                  : 'bg-forest-800 text-cream-100 hover:bg-forest-700'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      {isLoading || !forecast ? (
        <div className="py-20 text-center text-forest-700 animate-pulse font-medium">
          Generating AI forecast models for {selectedCommodity}...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Horizon Metrics, Graph & Drivers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Horizon Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Current */}
              <div className="rounded-xl bg-white p-4 border border-cream-200 shadow-xs">
                <span className="text-[11px] font-bold text-forest-500 uppercase tracking-wider block">
                  Today's Benchmark
                </span>
                <span className="text-xl sm:text-2xl font-black text-forest-950 mt-1 block">
                  ₹{forecast.current_price}
                  <span className="text-xs font-normal text-forest-600">/kg</span>
                </span>
                <span className="text-[10px] text-forest-400 mt-0.5 block">Current Modal Rate</span>
              </div>

              {/* 7-Day */}
              <div className="rounded-xl bg-white p-4 border border-cream-200 shadow-xs">
                <span className="text-[11px] font-bold text-forest-500 uppercase tracking-wider block">
                  +7 Days
                </span>
                <span className="text-xl sm:text-2xl font-black text-forest-950 mt-1 block">
                  ₹{forecast.forecast_7d}
                  <span className="text-xs font-normal text-forest-600">/kg</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                  {forecast.forecast_7d >= forecast.current_price ? '▲ Rising trend' : '▼ Easing trend'}
                </span>
              </div>

              {/* 15-Day Peak */}
              <div className="rounded-xl bg-forest-50 p-4 border border-forest-300 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gold-400 text-forest-950 text-[9px] font-black px-2 py-0.5 rounded-bl-md">
                  KEY WINDOW
                </div>
                <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                  +15 Days Forecast
                </span>
                <span className="text-xl sm:text-2xl font-black text-forest-950 mt-1 block">
                  ₹{forecast.forecast_15d}
                  <span className="text-xs font-normal text-forest-600">/kg</span>
                </span>
                <span className="text-[10px] text-forest-700 font-semibold mt-0.5 block">
                  {forecast.peak_window}
                </span>
              </div>

              {/* 30-Day */}
              <div className="rounded-xl bg-white p-4 border border-cream-200 shadow-xs">
                <span className="text-[11px] font-bold text-forest-500 uppercase tracking-wider block">
                  +30 Days Forecast
                </span>
                <span className="text-xl sm:text-2xl font-black text-forest-950 mt-1 block">
                  ₹{forecast.forecast_30d}
                  <span className="text-xs font-normal text-forest-600">/kg</span>
                </span>
                <span className="text-[10px] text-forest-500 mt-0.5 block">
                  Confidence: {forecast.confidence_score}%
                </span>
              </div>
            </div>

            {/* Interactive SVG Projection Chart */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 border border-cream-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-cream-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-forest-950 flex items-center gap-2">
                    Predicted Price Curve ({forecast.commodity})
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {forecast.expected_trend.toUpperCase()} OUTLOOK
                    </span>
                  </h3>
                  <p className="text-xs text-forest-600 mt-0.5">
                    Historical trend vs forward projected price band with 90% confidence limits.
                  </p>
                </div>
                <div className="text-xs text-forest-500 font-medium">
                  Region: <span className="text-forest-900 font-bold">{forecast.region}</span>
                </div>
              </div>

              {/* SVG Curve */}
              <div className="w-full overflow-x-auto py-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-48 sm:h-56 select-none"
                >
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map((ratio) => {
                    const y = chartHeight - 20 - ratio * (chartHeight - 40);
                    return (
                      <line
                        key={ratio}
                        x1="30"
                        y1={y}
                        x2={chartWidth - 20}
                        y2={y}
                        stroke="#f3ebd6"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Polyline line */}
                  <polyline
                    fill="none"
                    stroke="#2d6b4f"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylineCoords}
                  />

                  {/* Peak Marker Line */}
                  <line
                    x1={getX(4)}
                    y1="10"
                    x2={getX(4)}
                    y2={chartHeight - 20}
                    stroke="#e6b422"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Data Points */}
                  {points.map((p, idx) => {
                    const x = getX(idx);
                    const y = getY(p.predicted_price);
                    const isToday = p.day_offset === 0;
                    const isPeak = idx === 4;

                    return (
                      <g key={idx}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isToday || isPeak ? 6 : 4}
                          fill={isPeak ? '#e6b422' : isToday ? '#1b382d' : '#2d6b4f'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#0d1e18"
                        >
                          ₹{p.predicted_price}
                        </text>
                        <text
                          x={x}
                          y={chartHeight - 5}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#5fa585"
                          fontWeight={isToday || isPeak ? 'bold' : 'normal'}
                        >
                          {p.date_label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-forest-500 pt-2 border-t border-cream-100">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-forest-900 inline-block" /> Past / Today
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-forest-600 inline-block" /> Forecast
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-gold-500 inline-block" /> Peak Window
                  </span>
                </div>
                <span>Algorithm: Hybrid LSTM + Mandi Inflow Time-Series</span>
              </div>
            </div>

            {/* Seasonal Drivers & Impact Factors */}
            <div className="rounded-2xl bg-white p-5 border border-cream-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-forest-950 flex items-center gap-2">
                <Compass className="h-4 w-4 text-forest-600" />
                Key Seasonal Market Drivers Influencing {forecast.commodity}
              </h3>
              <ul className="space-y-2">
                {forecast.seasonal_drivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-forest-800">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Role-Specific Actionable Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Farmer Strategy */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Farmer Advisory
                </div>
                <h4 className="text-sm font-black text-emerald-950">Harvest & Dispatch Recommendation</h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {forecast.farmer_advisory}
                </p>
                <div className="pt-2">
                  <Link
                    to="/farmer/listings/new"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                  >
                    List Produce at Recommended Price <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Buyer Strategy */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <DollarSign className="h-4 w-4 text-amber-600" /> Commercial Buyer Advisory
                </div>
                <h4 className="text-sm font-black text-amber-950">Procurement & Booking Strategy</h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {forecast.buyer_advisory}
                </p>
                <div className="pt-2">
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline"
                  >
                    Explore Grower Listings Now <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Interactive AgriForecast Chatbot */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-cream-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
              {/* Chatbot Header */}
              <div className="bg-forest-900 p-4 text-cream-50 flex items-center gap-2.5 border-b border-forest-800">
                <div className="h-9 w-9 rounded-xl bg-gold-500 text-forest-950 flex items-center justify-center font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    AgriForecast AI Advisor
                    <span className="h-2 w-2 rounded-full bg-gold-400 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-forest-200">Forward price curve & harvest planning</p>
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div className="bg-forest-50 p-2.5 border-b border-forest-100 flex gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => handleSendMessage(`When will ${selectedCommodity} prices peak?`)}
                  className="rounded-lg bg-white px-2.5 py-1 text-forest-800 border border-forest-200 hover:bg-forest-100 transition whitespace-nowrap shadow-2xs"
                >
                  When is Peak?
                </button>
                <button
                  onClick={() => handleSendMessage(`Should I harvest ${selectedCommodity} now or wait 10 days?`)}
                  className="rounded-lg bg-white px-2.5 py-1 text-forest-800 border border-forest-200 hover:bg-forest-100 transition whitespace-nowrap shadow-2xs"
                >
                  Harvest Timing?
                </button>
                <button
                  onClick={() => handleSendMessage(`What is the 30-day forecast for ${selectedCommodity}?`)}
                  className="rounded-lg bg-white px-2.5 py-1 text-forest-800 border border-forest-200 hover:bg-forest-100 transition whitespace-nowrap shadow-2xs"
                >
                  30-Day Outlook?
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-cream-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                        msg.sender === 'user'
                          ? 'bg-forest-700 text-white rounded-br-none'
                          : 'bg-white text-forest-950 border border-cream-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-forest-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                {isBotThinking && (
                  <div className="flex items-center gap-1.5 text-xs text-forest-600 bg-white rounded-xl p-2.5 border border-cream-200 self-start animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                    Calculating multi-horizon forecast models...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-cream-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask anything about ${selectedCommodity} price predictions...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-xl bg-cream-50 px-3.5 py-2 text-xs text-forest-950 border border-cream-200 focus:outline-hidden focus:border-forest-600 focus:bg-white transition"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim()}
                  className="h-8 w-8 rounded-xl bg-forest-700 text-cream-50 flex items-center justify-center hover:bg-forest-800 disabled:opacity-40 transition shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
