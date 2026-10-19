import React from 'react';
import { NetProfitResult, Offer } from '../types';
import { TrendingUp, Truck, AlertTriangle, CheckCircle, Percent, ArrowRight, Volume2 } from 'lucide-react';
import { speakVoiceAI } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

interface NetProfitBreakdownProps {
  result: NetProfitResult;
  offer: Offer;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  isProcessing?: boolean;
}

export const NetProfitBreakdown: React.FC<NetProfitBreakdownProps> = ({
  result,
  offer,
  onAccept,
  onReject,
  isProcessing = false,
}) => {
  const { language } = useLanguage();

  const handleReadAloud = () => {
    speakVoiceAI(result.explanation, language);
  };

  const isRank1 = result.rank === 1;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs transition-all ${
        isRank1
          ? 'border-forest-500 bg-forest-50/50 ring-1 ring-forest-500'
          : 'border-cream-300 bg-white hover:border-forest-300'
      }`}
    >
      {/* Top Banner: Rank + Buyer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              isRank1
                ? 'bg-forest-700 text-cream-50 shadow-xs'
                : 'bg-cream-300 text-forest-900'
            }`}
          >
            #{result.rank}
          </span>
          <div>
            <h4 className="font-bold text-forest-950 text-base">
              {offer.buyer?.business_name || offer.buyer?.full_name || 'Verified Buyer'}
            </h4>
            <p className="text-xs text-forest-700">
              Offered: ₹{offer.offered_price_per_kg}/kg for {offer.quantity_kg.toLocaleString('en-IN')} kg
              {offer.pickup_or_delivery === 'pickup' ? (
                <span className="ml-2 inline-flex items-center text-forest-700 font-medium">
                  • Farm-gate pickup (₹0 transport)
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center text-amber-700 font-medium">
                  • Delivery to {offer.delivery_location || 'Buyer Location'}
                </span>
              )}
            </p>
          </div>
        </div>

        {isRank1 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-forest-600 px-2.5 py-1 text-xs font-semibold text-cream-50 shadow-xs">
            <CheckCircle className="h-3.5 w-3.5" /> Highest Net Take-Home
          </span>
        )}
      </div>

      {/* Financial Comparison Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        {/* 1. Gross */}
        <div className="rounded-xl bg-cream-100 p-2.5 border border-cream-200">
          <span className="text-[11px] font-medium text-forest-700 block">Gross Revenue</span>
          <span className="text-sm sm:text-base font-bold text-forest-950">
            ₹{result.gross_revenue.toLocaleString('en-IN')}
          </span>
        </div>

        {/* 2. Transport */}
        <div className="rounded-xl bg-amber-50/60 p-2.5 border border-amber-200">
          <span className="text-[11px] font-medium text-amber-800 flex items-center justify-center gap-1">
            <Truck className="h-3 w-3" /> Transport
          </span>
          <span className="text-sm sm:text-base font-bold text-amber-900">
            {result.transport_cost === 0 ? '₹0' : `-₹${result.transport_cost.toLocaleString('en-IN')}`}
          </span>
        </div>

        {/* 3. Transit Loss */}
        <div className="rounded-xl bg-rose-50/60 p-2.5 border border-rose-200">
          <span className="text-[11px] font-medium text-rose-800 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Transit Loss
          </span>
          <span className="text-sm sm:text-base font-bold text-rose-900">
            -₹{result.loss_cost.toLocaleString('en-IN')}
          </span>
        </div>

        {/* 4. Platform Fee */}
        <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-200">
          <span className="text-[11px] font-medium text-gray-700 flex items-center justify-center gap-1">
            <Percent className="h-3 w-3" /> Handling (2%)
          </span>
          <span className="text-sm sm:text-base font-bold text-gray-800">
            -₹{result.handling_cost.toLocaleString('en-IN')}
          </span>
        </div>

        {/* 5. Net Profit */}
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-forest-600 p-2.5 text-cream-50 shadow-xs border border-forest-700">
          <span className="text-[11px] font-semibold text-cream-200 flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3 text-gold-400" /> Net Take-Home
          </span>
          <span className="text-base sm:text-lg font-black text-white">
            ₹{result.net_profit.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Explanation Quote & Audio narration */}
      <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-cream-50 p-3 border border-cream-200">
        <p className="flex-1 text-xs text-forest-900 leading-relaxed">
          <strong className="text-forest-950 font-semibold">NetProfit Analysis: </strong>
          {result.explanation}
        </p>
        <button
          type="button"
          onClick={handleReadAloud}
          title="Read aloud using Voice AI"
          className="rounded-lg p-1.5 text-forest-700 hover:bg-cream-200 hover:text-forest-900 transition"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons for Farmer */}
      {offer.status === 'pending' && onAccept && (
        <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-cream-200 pt-3">
          {onReject && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onReject(offer.id)}
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Decline Offer
            </button>
          )}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAccept(offer.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-4 py-2 text-xs font-bold text-cream-50 shadow-xs hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
          >
            Accept Offer & Create Order <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
