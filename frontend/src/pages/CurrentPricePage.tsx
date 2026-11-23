import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  Filter,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Bot,
  Send,
  Building2,
  Calendar,
  Layers,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { pricesApi } from '../api/client';
import { MandiPrice, PriceChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const CurrentPricePage: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<PriceChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Namaste! I am your AgriMarket AI Advisor. Ask me anything about current mandi prices, inter-market rate arbitrage, or how FairFarm direct sales compare with traditional APMC commissions.',
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  useEffect(() => {
    async function loadPrices() {
      setIsLoading(true);
      try {
        const data = await pricesApi.getMandiPrices({
          state: selectedState,
          search: searchTerm,
        });
        setPrices(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrices();
  }, [selectedState, searchTerm]);

  const filteredPrices = prices.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

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
        commodity: filteredPrices[0]?.commodity || 'Tomato',
        mandi: filteredPrices[0]?.market_name || 'Pune APMC',
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

  const states = ['all', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Punjab', 'Haryana'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 p-6 sm:p-8 text-cream-50 shadow-md border border-forest-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-700/80 px-3 py-1 text-xs font-semibold text-gold-300 mb-2 border border-forest-600">
              <TrendingUp className="h-3 w-3" /> Live APMC Mandi Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Current Agricultural Market Prices
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-forest-200 max-w-2xl">
              Real-time modal benchmark rates across major agricultural wholesale mandis in India. Compare open mandi rates with direct farmgate contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              to="/prices/future"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-forest-950 hover:bg-gold-400 transition shadow-xs"
            >
              <Sparkles className="h-4 w-4" /> View Future Price Predictions
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-cream-100 hover:bg-forest-700 transition border border-forest-700"
            >
              <ShoppingBag className="h-4 w-4" /> Go to Marketplace
            </Link>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-6 pt-6 border-t border-forest-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Top Gainer Today</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              Green Chilli (Byadagi) <ArrowUpRight className="h-3.5 w-3.5" /> +5.6%
            </span>
          </div>
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Active APMC Mandis</span>
            <span className="text-sm font-bold text-gold-300 mt-0.5 block">
              12 Regional Hubs
            </span>
          </div>
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Daily Arrivals Tracked</span>
            <span className="text-sm font-bold text-cream-100 mt-0.5 block">
              43,890 Quintals
            </span>
          </div>
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Direct vs Mandi Margin</span>
            <span className="text-sm font-bold text-emerald-300 mt-0.5 block">
              +18% to +24% on FairFarm
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Price List & AI Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Search, Filters, and Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & State Filter Bar */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-cream-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-forest-400" />
                <input
                  type="text"
                  placeholder="Search commodity (e.g. Tomato, Onion, Wheat) or Mandi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl bg-cream-50 pl-10 pr-4 py-2 text-sm text-forest-950 border border-cream-200 focus:outline-hidden focus:border-forest-600 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-forest-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="rounded-xl bg-cream-50 px-3 py-2 text-xs sm:text-sm font-medium text-forest-950 border border-cream-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All States</option>
                  {states.filter((s) => s !== 'all').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-forest-500 font-semibold mr-1">Category:</span>
              {['all', 'vegetables', 'grains', 'spices', 'oilseeds'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1 font-medium capitalize transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-forest-700 text-white font-semibold shadow-xs'
                      : 'bg-cream-100 text-forest-800 hover:bg-cream-200'
                  }`}
                >
                  {cat === 'all' ? 'All Produce' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mandi Rates Cards / Table */}
          {isLoading ? (
            <div className="py-20 text-center text-forest-700 animate-pulse font-medium">
              Loading real-time mandi prices...
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
              <Info className="mx-auto h-10 w-10 text-forest-400 mb-2" />
              <h3 className="text-base font-bold text-forest-950">No mandi data matching your search</h3>
              <p className="text-xs text-forest-600 mt-1">Try resetting the state filter or search keywords.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrices.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white p-4 sm:p-5 border border-cream-200 shadow-xs hover:border-forest-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-forest-950">{item.commodity}</h3>
                      <span className="text-[11px] font-semibold text-forest-600 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200 capitalize">
                        {item.variety}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-forest-700">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-forest-500" /> {item.market_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-forest-500" /> {item.state}
                      </span>
                      <span>•</span>
                      <span>{item.arrivals_quintal.toLocaleString('en-IN')} Quintals arrival</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-cream-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-forest-500 font-medium">Range: ₹{item.min_price} – ₹{item.max_price}/{item.unit}</div>
                      <div className="text-xl font-black text-forest-950">
                        ₹{item.modal_price} <span className="text-xs font-semibold text-forest-600">/ {item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.trend === 'up'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.trend === 'down'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
                        {item.trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
                        {item.trend === 'stable' && <Minus className="h-3.5 w-3.5" />}
                        {item.daily_change_percent > 0 ? `+${item.daily_change_percent}%` : `${item.daily_change_percent}%`}
                      </span>
                      <span className="block text-[10px] text-forest-400 mt-1">24h change</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mandi vs FairFarm Direct NetProfit Callout */}
          <div className="rounded-2xl bg-forest-50 border border-forest-200 p-5 space-y-2">
            <h4 className="text-sm font-black text-forest-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gold-600" />
              Why FairFarm Direct Prices Beat Nominal Mandi Rates
            </h4>
            <p className="text-xs text-forest-800 leading-relaxed">
              When selling through traditional APMC mandis, nominal price quotes hide heavy middleman cuts: commission agents take 6–8%, unloading charges deduct 2%, and delayed transit causes 4–6% produce spoilage. FairFarm connects you directly to verified buyers with automated NetProfit ranking and pooled shared transport!
            </p>
          </div>
        </div>

        {/* Right Col: Interactive Market Advisor Chatbot */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-cream-200 shadow-xs overflow-hidden flex flex-col h-[600px]">
            {/* Chatbot Header */}
            <div className="bg-forest-900 p-4 text-cream-50 flex items-center gap-2.5 border-b border-forest-800">
              <div className="h-9 w-9 rounded-xl bg-forest-700 flex items-center justify-center text-gold-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  AgriMarket AI Advisor
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[11px] text-forest-200">Real-time price & market intelligence</p>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="bg-forest-50 p-2.5 border-b border-forest-100 flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleSendMessage('Where is tomato selling highest today?')}
                className="rounded-lg bg-white px-2.5 py-1 text-forest-800 border border-forest-200 hover:bg-forest-100 transition whitespace-nowrap shadow-2xs"
              >
                Top Tomato Mandi?
              </button>
              <button
                onClick={() => handleSendMessage('Should I sell onions today in Pune or wait?')}
                className="rounded-lg bg-white px-2.5 py-1 text-forest-800 border border-forest-200 hover:bg-forest-100 transition whitespace-nowrap shadow-2xs"
              >
                Sell Onions Now?
              </button>
              <button
                onClick={() => handleSendMessage('How does FairFarm direct price compare to mandi commission?')}
                className="rounded-lg bg-white px-2.5 py-1 text-forest-800 border border-forest-200 hover:bg-forest-100 transition whitespace-nowrap shadow-2xs"
              >
                Mandi vs Direct?
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
                  <Bot className="h-3.5 w-3.5 text-forest-600" />
                  Analyzing mandi rates and market arrivals...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-cream-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about mandi rates, crops, or timing..."
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
    </div>
  );
};
