import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minus, Send, TrendingUp, Sparkles, ChevronDown, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { pricesApi } from '../api/client';
import { PriceChatMessage } from '../types';

// ─── SVS Calligraphic Monogram SVG ──────────────────────────────────────────
const SVSMonogram: React.FC<{ size?: number; color?: string }> = ({
  size = 36,
  color = '#f3ce59',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="SVS – Smart Value System"
  >
    {/* Outer decorative ring */}
    <circle cx="50" cy="50" r="47" stroke={color} strokeWidth="1.2" strokeOpacity="0.35" />
    <circle cx="50" cy="50" r="43" stroke={color} strokeWidth="0.6" strokeOpacity="0.2" />

    {/* S – left calligraphic S stroke */}
    <path
      d="M20 34 C20 27, 28 23, 35 25 C42 27, 44 32, 40 37
         C36 42, 26 42, 24 48 C22 54, 26 61, 34 62
         C40 63, 46 60, 46 55"
      stroke={color}
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.95"
    />
    {/* S – left top serif flourish */}
    <path d="M20 34 C17 31, 18 28, 20 27" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    {/* S – left bottom serif flourish */}
    <path d="M46 55 C47 52, 49 51, 50 51" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

    {/* V – center calligraphic V */}
    <path
      d="M36 26 L50 70 L64 26"
      stroke={color}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.95"
    />
    {/* V – hairline upstroke on right leg */}
    <path
      d="M50 70 L64 26"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    {/* V – connecting swash from bottom */}
    <path d="M50 70 C50 73, 51 75, 52 76" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />

    {/* S – right calligraphic S stroke */}
    <path
      d="M54 45 C54 38, 62 34, 69 36 C76 38, 79 44, 75 49
         C71 54, 61 54, 59 60 C57 66, 62 73, 70 74
         C76 75, 82 72, 82 67"
      stroke={color}
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.95"
    />
    {/* S – right top serif flourish */}
    <path d="M54 45 C52 42, 53 39, 54 38" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    {/* S – right bottom serif flourish */}
    <path d="M82 67 C83 64, 84 63, 84 62" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

    {/* Central dot accent */}
    <circle cx="50" cy="50" r="1.5" fill={color} opacity="0.4" />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────
type TabMode = 'current' | 'forecast';

interface TabMessages {
  current: PriceChatMessage[];
  forecast: PriceChatMessage[];
}

// ─── Suggested Questions ─────────────────────────────────────────────────────
const FARMER_CURRENT_SUGGESTIONS = [
  'Which mandi has the best tomato price?',
  'What is the current onion rate in Pune?',
  'Compare wheat prices across markets',
];

const BUYER_CURRENT_SUGGESTIONS = [
  'Where can I buy tomatoes at the lowest price?',
  'What is today\'s onion price in Lasalgaon?',
  'Compare potato prices across mandis',
];

const FARMER_FORECAST_SUGGESTIONS = [
  'What will tomato price be next month?',
  'Should I sell onions now or wait 15 days?',
  'Will wheat prices go up in next 30 days?',
];

const BUYER_FORECAST_SUGGESTIONS = [
  'Will onion prices rise in the coming weeks?',
  'What is the expected tomato price after 30 days?',
  'Which crops offer better prices next season?',
];

// ─── Welcome Messages ─────────────────────────────────────────────────────────
const FARMER_CURRENT_WELCOME: PriceChatMessage = {
  id: 'welcome-farmer-current',
  sender: 'assistant',
  text: 'Namaste! 🌾 I\'m SVS — your Smart Value Assistant. Ask me about current mandi prices, best markets to sell your produce, or how FairFarm direct rates compare with APMC commissions.',
  timestamp: 'Just now',
};

const BUYER_CURRENT_WELCOME: PriceChatMessage = {
  id: 'welcome-buyer-current',
  sender: 'assistant',
  text: 'Welcome! 🛒 I\'m SVS — your Smart Value Assistant. Ask me about current commodity prices, the best markets to source from, or how FairFarm direct procurement saves you 15–22% vs open mandi buying.',
  timestamp: 'Just now',
};

const FARMER_FORECAST_WELCOME: PriceChatMessage = {
  id: 'welcome-farmer-forecast',
  sender: 'assistant',
  text: '📈 Future Price Advisor mode. Ask me about price forecasts for the next 7, 15, or 30 days. I\'ll help you decide the best time to harvest and sell your produce for maximum profit.',
  timestamp: 'Just now',
};

const BUYER_FORECAST_WELCOME: PriceChatMessage = {
  id: 'welcome-buyer-forecast',
  sender: 'assistant',
  text: '📊 Future Price Advisor mode. I can forecast commodity price trends for the next 7 to 60 days, helping you plan procurement at the most cost-effective time.',
  timestamp: 'Just now',
};

// ─── Mini Price Card for quick context ───────────────────────────────────────
const MiniPriceSnapshot: React.FC<{ commodity: string; price: number; trend: string; change: number }> = ({
  commodity, price, trend, change,
}) => {
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-amber-400';
  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  return (
    <div className="flex items-center justify-between bg-forest-800/60 rounded-lg px-3 py-1.5 text-xs border border-forest-700/50">
      <span className="text-cream-200 font-medium">{commodity}</span>
      <span className="font-bold text-white">₹{price}/kg</span>
      <span className={`font-semibold ${trendColor}`}>{trendArrow} {change > 0 ? '+' : ''}{change}%</span>
    </div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: PriceChatMessage }> = ({ msg }) => {
  const isUser = msg.sender === 'user';
  // Format markdown-style bold and line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
          isUser
            ? 'bg-forest-600 text-white rounded-br-sm'
            : 'bg-white text-forest-950 border border-cream-200 rounded-bl-sm'
        }`}
      >
        {formatText(msg.text)}
      </div>
      <span className="text-[10px] text-forest-400 px-1">{msg.timestamp}</span>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-2">
    <div className="h-6 w-6 rounded-full bg-forest-800 flex items-center justify-center flex-shrink-0">
      <SVSMonogram size={16} />
    </div>
    <div className="bg-white border border-cream-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-forest-400 animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-forest-400 animate-bounce [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-forest-400 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const SVSChatbot: React.FC = () => {
  const { role } = useAuth();

  // ── Farmer-only access guard ──────────────────────────────────────────────
  // SVS is exclusively available to farmers. Buyers and unauthenticated users
  // must not see the chatbot on any page (Default Interface or Buyer Interface).
  if (role !== 'farmer') return null;

  const userRole = 'farmer' as const;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('current');
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Separate message history per tab
  const getWelcomes = useCallback((): TabMessages => ({
    current: [FARMER_CURRENT_WELCOME],
    forecast: [FARMER_FORECAST_WELCOME],
  }), []);

  const [messages, setMessages] = useState<TabMessages>(getWelcomes);

  const prevRole = useRef(userRole);
  useEffect(() => {
    if (prevRole.current !== userRole) {
      prevRole.current = userRole;
      setMessages(getWelcomes());
    }
  }, [userRole, getWelcomes]);

  const [snapshots, setSnapshots] = useState<{ commodity: string; price: number; trend: string; change: number }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab, isThinking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Load quick price snapshot on open — deduplicated by commodity
  useEffect(() => {
    if (isOpen && snapshots.length === 0) {
      pricesApi.getMandiPrices().then((data) => {
        if (Array.isArray(data)) {
          // Deduplicate: keep one entry per commodity (highest modal price)
          const seen = new Map<string, { commodity: string; price: number; trend: string; change: number }>();
          (data as any[]).forEach((d) => {
            const existing = seen.get(d.commodity);
            if (!existing || d.modal_price > existing.price) {
              seen.set(d.commodity, {
                commodity: d.commodity,
                price: d.modal_price,
                trend: d.trend,
                change: d.daily_change_percent,
              });
            }
          });
          setSnapshots(Array.from(seen.values()).slice(0, 3));
        }
      }).catch(() => {});
    }
  }, [isOpen, snapshots.length]);

  // Stop pulse after 8s
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const suggestions =
    activeTab === 'current'
      ? FARMER_CURRENT_SUGGESTIONS
      : FARMER_FORECAST_SUGGESTIONS;

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isThinking) return;

    const userMsg: PriceChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], userMsg],
    }));
    if (!overrideText) setInput('');
    setIsThinking(true);

    try {
      // Detect commodity from text for context
      const commodityHints: Record<string, string> = {
        tomato: 'Tomato', onion: 'Onion', potato: 'Potato',
        wheat: 'Wheat', rice: 'Basmati Rice', chilli: 'Green Chilli',
        chili: 'Green Chilli', soybean: 'Soybean', ginger: 'Ginger',
      };
      const detectedCommodity = Object.entries(commodityHints).find(([k]) =>
        text.toLowerCase().includes(k)
      )?.[1] || 'Tomato';

      const response = await pricesApi.askChatbot(text, {
        commodity: detectedCommodity,
        mode: activeTab,
        role: userRole,
      } as any);

      const botMsg: PriceChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], botMsg],
      }));
    } catch {
      const errMsg: PriceChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], errMsg],
      }));
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages((prev) => ({
      ...prev,
      [activeTab]: [getWelcomes()[activeTab]],
    }));
  };

  const handleTabSwitch = (tab: TabMode) => {
    setActiveTab(tab);
    setInput('');
    // Don't reset messages — preserve history
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50" id="svs-chatbot-launcher">
        {/* Tooltip label */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-forest-900 text-cream-100 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none select-none border border-forest-700">
          SVS – Price Assistant
        </div>

        <button
          id="svs-launcher-btn"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          aria-label="Open SVS Smart Value Assistant"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2"
          style={{
            background: 'linear-gradient(135deg, #1b382d 0%, #265540 50%, #1b382d 100%)',
            boxShadow: '0 8px 32px rgba(13,30,24,0.55), 0 0 0 1px rgba(243,206,89,0.25)',
          }}
        >
          {/* Glow ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(243,206,89,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Pulse rings */}
          {showPulse && (
            <>
              <span className="absolute inset-0 rounded-full border border-gold-400/40 animate-ping" />
              <span className="absolute -inset-1 rounded-full border border-gold-400/20 animate-ping [animation-delay:400ms]" />
            </>
          )}

          {/* Hover glow */}
          <span
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 0 20px rgba(243,206,89,0.4), 0 0 40px rgba(243,206,89,0.15)' }}
          />

          <SVSMonogram size={38} color="#f3ce59" />
        </button>

        {/* SVS label badge */}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-widest text-forest-700 uppercase whitespace-nowrap select-none">
          SVS
        </span>
      </div>
    );
  }

  return (
    <div
      id="svs-chatbot-window"
      className="fixed bottom-6 left-6 z-50 flex flex-col"
      style={{
        width: 'min(420px, calc(100vw - 24px))',
        maxHeight: isMinimized ? 'auto' : 'min(600px, calc(100vh - 48px))',
      }}
    >
      {/* ── Window Container ── */}
      <div
        className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-forest-800/60"
        style={{
          background: 'linear-gradient(180deg, #0d1e18 0%, #1b382d 100%)',
          boxShadow: '0 24px 64px rgba(13,30,24,0.65), 0 0 0 1px rgba(243,206,89,0.12)',
          height: isMinimized ? 'auto' : 'min(600px, calc(100vh - 48px))',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-forest-800/70 flex-shrink-0"
          style={{ background: 'rgba(13,30,24,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #265540, #1b382d)',
              boxShadow: '0 0 12px rgba(243,206,89,0.2)',
            }}
          >
            <SVSMonogram size={28} color="#f3ce59" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white leading-none truncate">
                SVS – Smart Value Assistant
              </h3>
              <span className="flex items-center gap-1 flex-shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
              </span>
            </div>
            <p className="text-[11px] text-forest-300 mt-0.5 truncate">
              🌾 Farmer Mode · AgriMarket Intelligence
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsMinimized((v) => !v)}
              aria-label="Minimize"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-forest-300 hover:text-white hover:bg-forest-800 transition"
            >
              {isMinimized ? <ChevronDown className="h-4 w-4 rotate-180" /> : <Minus className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-forest-300 hover:text-white hover:bg-rose-900/60 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* ── Tab Bar ── */}
            <div className="flex border-b border-forest-800/70 flex-shrink-0 bg-forest-950/50">
              <button
                id="svs-tab-current"
                onClick={() => handleTabSwitch('current')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold tracking-wide uppercase transition relative ${
                  activeTab === 'current'
                    ? 'text-gold-400'
                    : 'text-forest-400 hover:text-forest-200'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Current Price
                {activeTab === 'current' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
                )}
              </button>

              <div className="w-px bg-forest-800/70 my-2" />

              <button
                id="svs-tab-forecast"
                onClick={() => handleTabSwitch('forecast')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold tracking-wide uppercase transition relative ${
                  activeTab === 'forecast'
                    ? 'text-gold-400'
                    : 'text-forest-400 hover:text-forest-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Future Price
                {activeTab === 'forecast' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400 rounded-full" />
                )}
              </button>
            </div>

            {/* ── Quick Price Snapshots (Current tab only) ── */}
            {activeTab === 'current' && snapshots.length > 0 && (
              <div className="px-3 py-2 space-y-1 border-b border-forest-800/50 flex-shrink-0 bg-forest-950/30">
                <p className="text-[9px] font-bold uppercase tracking-widest text-forest-500 mb-1">Live Mandi Snapshot</p>
                {snapshots.map((s, i) => (
                  <MiniPriceSnapshot key={`${s.commodity}-${i}`} {...s} />
                ))}
              </div>
            )}

            {/* ── Forecast disclaimer (Forecast tab only) ── */}
            {activeTab === 'forecast' && (
              <div className="px-3 py-2 border-b border-forest-800/50 flex-shrink-0 bg-amber-950/20">
                <p className="text-[10px] text-amber-400/80 leading-relaxed">
                  ⚠️ AI price forecasts are model-based estimates. Not guaranteed prices.
                </p>
              </div>
            )}

            {/* ── Suggested Questions ── */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0 border-b border-forest-800/40 bg-forest-950/20">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={isThinking}
                  className="whitespace-nowrap rounded-full bg-forest-800/70 hover:bg-forest-700 text-cream-200 text-[11px] px-3 py-1 transition border border-forest-700/50 hover:border-gold-500/40 disabled:opacity-40 flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-gradient-to-b from-forest-950/20 to-cream-50/5">
              {messages[activeTab].map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {isThinking && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div className="border-t border-forest-800/60 px-3 py-2.5 flex-shrink-0 bg-forest-950/60">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    id="svs-chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={
                      activeTab === 'current'
                        ? 'Ask about mandi prices…'
                        : 'Ask about price forecasts…'
                    }
                    disabled={isThinking}
                    className="w-full bg-forest-900/80 border border-forest-700/60 rounded-xl px-3.5 py-2 text-xs text-cream-100 placeholder-forest-500 focus:outline-none focus:border-gold-500/60 focus:bg-forest-900 transition disabled:opacity-50"
                  />
                </div>

                <button
                  id="svs-send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                  aria-label="Send message"
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
                  style={{
                    background: input.trim() && !isThinking
                      ? 'linear-gradient(135deg, #2d6b4f, #3b8764)'
                      : '#1b382d',
                    boxShadow: input.trim() && !isThinking ? '0 4px 12px rgba(43,107,79,0.4)' : 'none',
                  }}
                >
                  <Send className="h-3.5 w-3.5 text-cream-100" />
                </button>

                <button
                  onClick={handleClearChat}
                  aria-label="Clear conversation"
                  title="Clear chat"
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-forest-500 hover:text-forest-300 hover:bg-forest-800/60 transition flex-shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Footer note */}
              <p className="text-[9px] text-forest-600 text-center mt-1.5 select-none">
                SVS · Smart Value System · FairFarm AgriMarket Intelligence
              </p>
            </div>
          </>
        )}

        {/* Minimized state footer */}
        {isMinimized && (
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-forest-900/40 transition"
            onClick={() => setIsMinimized(false)}
          >
            <span className="text-[11px] text-forest-300">Click to expand SVS</span>
            <ChevronDown className="h-4 w-4 text-forest-400 rotate-180" />
          </div>
        )}
      </div>
    </div>
  );
};
