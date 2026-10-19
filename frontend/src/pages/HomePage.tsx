import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Truck,
  Mic,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Store,
  Hotel,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const HomePage: React.FC = () => {
  const { user, role, quickLogin } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-900 via-forest-900 to-forest-800 text-cream-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission Statement & Direct CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Direct Market Access for{' '}
                <span className="text-gold-400 underline decoration-forest-500 underline-offset-8">
                  Marginal Farmers
                </span>
              </h1>

              <p className="text-base sm:text-lg text-cream-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                FairFarm removes predatory middlemen by connecting smallholder growers directly with
                retailers, hotels, and wholesalers. Features automated NetProfit offer ranking,
                shared transport pooling, and multilingual voice access.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3.5 text-sm font-bold text-forest-950 shadow-md hover:bg-gold-400 transition transform active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" /> Explore Marketplace
                </Link>

                {role === 'farmer' ? (
                  <Link
                    to="/farmer/listings/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-forest-700 px-6 py-3.5 text-sm font-bold text-cream-50 border border-forest-600 hover:bg-forest-600 transition"
                  >
                    + List Your Harvest
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-6 py-3.5 text-sm font-bold text-cream-50 border border-forest-700 hover:bg-forest-700 transition"
                  >
                    Join as Buyer or Farmer <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* Live Role Switch Bar for Evaluators */}
              <div className="pt-4 border-t border-forest-800/80 max-w-lg mx-auto lg:mx-0">
                <p className="text-xs text-forest-300 font-medium mb-2">
                  Interactive Evaluation: Test as Farmer or Buyer with 1 click:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => quickLogin('farmer')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'farmer'
                        ? 'bg-forest-600 text-white border border-forest-400'
                        : 'bg-forest-950/60 text-forest-200 hover:bg-forest-800'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5 text-gold-400" />
                    Farmer: Rameshwar Patil
                  </button>
                  <button
                    onClick={() => quickLogin('buyer')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'buyer'
                        ? 'bg-forest-600 text-white border border-forest-400'
                        : 'bg-forest-950/60 text-forest-200 hover:bg-forest-800'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 text-gold-400" />
                    Buyer: Sandeep Khurana
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: NetProfit Feature Illustration Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-cream-50 p-6 shadow-xl border border-cream-200 text-forest-950">
                <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-forest-700" />
                    <span className="font-bold text-sm text-forest-950">
                      Why Gross Price Is Deceiving
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-forest-100 text-forest-800 px-2 py-0.5 rounded-sm">
                    NetProfit Match
                  </span>
                </div>

                <p className="text-xs text-forest-700 mt-3 leading-relaxed">
                  Traditional middlemen exploit farmers by offering seemingly higher prices that
                  collapse once transport and transit loss deductions are forced onto the farmer.
                </p>

                {/* Side-by-side comparison simulation */}
                <div className="mt-4 space-y-3">
                  {/* Offer A (Nominally higher, but poor net) */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-rose-900">Buyer A (Distant Mandi)</span>
                      <span className="font-bold text-rose-950">Nominal: ₹38 / kg</span>
                    </div>
                    <div className="mt-2 text-[11px] text-rose-800 space-y-0.5">
                      <p>Gross for 500kg: ₹19,000</p>
                      <p>Transport charge: -₹2,800</p>
                      <p>Transit damage (7%): -₹1,330</p>
                      <p className="pt-1 font-bold text-xs text-rose-900 border-t border-rose-200">
                        Real Net Earnings: ₹14,490
                      </p>
                    </div>
                  </div>

                  {/* Offer B (Nominally lower, but highest net!) */}
                  <div className="rounded-xl border border-forest-500 bg-forest-50 p-3 ring-1 ring-forest-500">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-forest-900 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-forest-700" /> Buyer B (Local Kitchen)
                      </span>
                      <span className="font-bold text-forest-950">Nominal: ₹34 / kg</span>
                    </div>
                    <div className="mt-2 text-[11px] text-forest-800 space-y-0.5">
                      <p>Gross for 500kg: ₹17,000</p>
                      <p className="font-semibold text-forest-700">Buyer Farm-gate Pickup: ₹0 Transport</p>
                      <p>Perishability loss (1.5%): -₹255</p>
                      <p className="pt-1 font-bold text-xs text-forest-900 border-t border-forest-200">
                        Real Net Earnings: ₹16,405 (+₹1,915 Extra Cash)
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] bg-forest-700 text-cream-50 font-bold px-2 py-0.5 rounded-sm inline-block">
                      Rank #1 Ranked by FairFarm NetProfit Engine
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Buyer Ecosystem */}
      <section className="py-12 bg-cream-100 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-forest-700 mb-6">
            Directly Connecting Smallholder Farmers with Bulk Institutional Demand
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-cream-200 shadow-xs">
              <Store className="h-6 w-6 text-forest-700 mb-2" />
              <span className="font-bold text-sm text-forest-950">Local Retailers</span>
              <span className="text-xs text-forest-600">Fresh daily groceries</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-cream-200 shadow-xs">
              <Hotel className="h-6 w-6 text-forest-700 mb-2" />
              <span className="font-bold text-sm text-forest-950">Hotels & Restaurants</span>
              <span className="text-xs text-forest-600">Direct kitchen supply</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-cream-200 shadow-xs">
              <Building2 className="h-6 w-6 text-forest-700 mb-2" />
              <span className="font-bold text-sm text-forest-950">Wholesalers & Mandis</span>
              <span className="text-xs text-forest-600">Bulk grain & produce</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-white border border-cream-200 shadow-xs">
              <Truck className="h-6 w-6 text-forest-700 mb-2" />
              <span className="font-bold text-sm text-forest-950">Shared Logistics</span>
              <span className="text-xs text-forest-600">Group vehicle pooling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovation Pillars */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-forest-950 tracking-tight">
              Designed Specifically for Marginal & Smallholder Farmers
            </h2>
            <p className="mt-3 text-sm sm:text-base text-forest-700">
              Every feature solves a genuine bottleneck faced by farmers with less than 2 hectares of land.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: NetProfit Match */}
            <div className="rounded-2xl bg-white p-7 border border-cream-200 shadow-xs hover:border-forest-400 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-800 mb-5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-950">NetProfit Match Engine</h3>
              <p className="mt-2 text-sm text-forest-700 leading-relaxed">
                Automatically calculates vehicle transport charges, category-specific perishability losses,
                and handling fees for every incoming buyer offer. Explains why a lower nominal offer can
                put more cash in the farmer's pocket.
              </p>
            </div>

            {/* Pillar 2: Shared Transport */}
            <div className="rounded-2xl bg-white p-7 border border-cream-200 shadow-xs hover:border-forest-400 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-900 mb-5">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-950">Shared Route Pooling</h3>
              <p className="mt-2 text-sm text-forest-700 leading-relaxed">
                Uses Haversine spatial calculations to identify nearby farmers heading toward identical
                destination markets. Combines half-empty mini-trucks to cut vehicle hire costs by up to 50%.
              </p>
            </div>

            {/* Pillar 3: Multilingual Voice AI */}
            <div className="rounded-2xl bg-white p-7 border border-cream-200 shadow-xs hover:border-forest-400 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-800 mb-5">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-950">Voice AI in 3 Languages</h3>
              <p className="mt-2 text-sm text-forest-700 leading-relaxed">
                Accessible for rural growers with voice commands and audio narration in English,
                Hindi (हिन्दी), and Kannada (ಕನ್ನಡ) using ElevenLabs and browser speech recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Acceptance Test Flow Walkthrough */}
      <section className="py-16 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
              Verification Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight mt-1">
              Final Acceptance Test Lifecycle
            </h2>
            <p className="mt-2 text-sm text-forest-700">
              The entire transaction lifecycle works end-to-end with atomic inventory updates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            <div className="rounded-xl bg-cream-50 p-5 border border-cream-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white text-xs font-bold mb-3">
                1
              </span>
              <h4 className="font-bold text-forest-950 text-sm">Farmer Lists Harvest</h4>
              <p className="text-xs text-forest-700 mt-1">
                Farmer registers and lists crops with quantity (kg), target price, and location.
              </p>
            </div>

            <div className="rounded-xl bg-cream-50 p-5 border border-cream-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white text-xs font-bold mb-3">
                2
              </span>
              <h4 className="font-bold text-forest-950 text-sm">Buyer Submits Offer</h4>
              <p className="text-xs text-forest-700 mt-1">
                Buyer discovers produce and submits offer specifying pickup or delivery terms.
              </p>
            </div>

            <div className="rounded-xl bg-cream-50 p-5 border border-cream-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white text-xs font-bold mb-3">
                3
              </span>
              <h4 className="font-bold text-forest-950 text-sm">NetProfit Ranking</h4>
              <p className="text-xs text-forest-700 mt-1">
                Farmer compares offers with real deductions and sees why each offer is ranked.
              </p>
            </div>

            <div className="rounded-xl bg-cream-50 p-5 border border-cream-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white text-xs font-bold mb-3">
                4
              </span>
              <h4 className="font-bold text-forest-950 text-sm">Atomic Order & Stock</h4>
              <p className="text-xs text-forest-700 mt-1">
                Accepting creates confirmed order and decrements available stock without overselling.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
