import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-forest-950 text-cream-200 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Statement */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 text-gold-300">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">FairFarm</span>
            </div>
            <p className="text-sm text-forest-200 leading-relaxed max-w-md">
              Solving Problem Statement 1.2: Direct Market Access Platform for Marginal Farmers.
              Empowering smallholder growers across India with direct business access, NetProfit match transparency,
              and shared vehicle pooling.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-forest-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-gold-400" /> Transparent Net Earnings
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-gold-400" /> Shared Farm Transport
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-gold-400" /> Direct Buyer Relationships
              </span>
            </div>
          </div>

          {/* Core Solutions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-sm text-forest-200">
              <li>{t('netProfitMatch')}</li>
              <li>{t('sharedTransportTitle')}</li>
              <li>{t('voiceAssistant')}</li>
              <li>Atomic Inventory Security</li>
              <li>Trilingual Access (EN, HI, KN)</li>
            </ul>
          </div>

          {/* DevHost 2026 Hackathon Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-3">
              DevHost 2026
            </h4>
            <p className="text-xs text-forest-200 leading-relaxed">
              Built for DevHost 2026 Hackathon addressing agricultural supply chain disintermediation
              and price discovery for Indian marginal farmers.
            </p>
            <div className="mt-4 rounded-lg bg-forest-900 p-3 border border-forest-800">
              <p className="text-[11px] font-semibold text-white">Stack Architecture:</p>
              <p className="text-[11px] text-forest-300 mt-0.5">
                React, TypeScript, Tailwind CSS, FastAPI, Supabase PostgreSQL, ElevenLabs Voice AI
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between text-xs text-forest-400 gap-4">
          <p>© 2026 FairFarm. Direct agricultural marketplace for marginal farmers.</p>
          <p>Pricing standard in Indian Rupees (₹) with real logistics calculation.</p>
        </div>
      </div>
    </footer>
  );
};
