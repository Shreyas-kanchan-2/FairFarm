import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { offersApi } from '../api/client';
import { Offer } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const BuyerOffersPage: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await offersApi.getMyOffers();
        setOffers(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-forest-950">My Purchase Offers</h1>
          <p className="text-xs sm:text-sm text-forest-700 mt-0.5">
            Track offers submitted to farmers and review accepted orders.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-cream-50 hover:bg-forest-800 transition shadow-xs self-start sm:self-auto"
        >
          Explore More Produce
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-forest-700">Loading your offers...</div>
      ) : offers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
          <Package className="mx-auto h-12 w-12 text-forest-400 mb-3" />
          <h3 className="text-lg font-bold text-forest-950">No offers submitted yet</h3>
          <p className="text-xs text-forest-600 mt-1 max-w-sm mx-auto">
            Browse the marketplace and submit purchase offers directly to marginal farmers.
          </p>
          <Link
            to="/marketplace"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-5 py-2.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition"
          >
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const isAccepted = offer.status === 'accepted';
            return (
              <div
                key={offer.id}
                className={`rounded-2xl border p-5 shadow-xs transition ${
                  isAccepted
                    ? 'border-forest-500 bg-forest-50/40 ring-1 ring-forest-500'
                    : 'border-cream-300 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-forest-950 text-base">
                        {offer.listing?.produce_name || 'Produce Harvest'}
                      </h3>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-xs text-forest-600 mt-0.5">
                      Submitted on: {new Date(offer.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-forest-600 block">
                      Total Bid Value
                    </span>
                    <span className="text-base font-black text-forest-950">
                      ₹{(offer.offered_price_per_kg * offer.quantity_kg).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                    <span className="text-forest-600 block text-[10px]">Offered Rate</span>
                    <span className="font-bold text-forest-950">₹{offer.offered_price_per_kg}/kg</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                    <span className="text-forest-600 block text-[10px]">Quantity</span>
                    <span className="font-bold text-forest-950">{offer.quantity_kg.toLocaleString('en-IN')} kg</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                    <span className="text-forest-600 block text-[10px]">Logistics</span>
                    <span className="font-bold text-forest-950 capitalize">{offer.pickup_or_delivery}</span>
                  </div>
                  <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                    <span className="text-forest-600 block text-[10px]">Delivery Point</span>
                    <span className="font-bold text-forest-950 truncate block">
                      {offer.delivery_location || 'Farm Gate'}
                    </span>
                  </div>
                </div>

                {offer.message && (
                  <p className="mt-3 text-xs text-forest-800 bg-cream-50/70 p-2.5 rounded-lg border border-cream-200">
                    <strong>Note:</strong> {offer.message}
                  </p>
                )}

                {isAccepted && (
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-forest-200 text-xs">
                    <span className="text-forest-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-forest-600" /> Farmer accepted this offer!
                    </span>
                    <Link
                      to="/orders"
                      className="font-bold text-forest-700 hover:text-forest-950 inline-flex items-center gap-1"
                    >
                      Track Order & Logistics <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
