import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShoppingBag,
  Package,
  Receipt,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { offersApi, ordersApi, produceApi } from '../api/client';
import { Offer, Order, ProduceListing } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredListings, setFeaturedListings] = useState<ProduceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBuyerData() {
      setIsLoading(true);
      try {
        const [myOffers, allOrders, allListings] = await Promise.all([
          offersApi.getMyOffers(),
          ordersApi.getAll(),
          produceApi.getAll(),
        ]);

        setOffers(myOffers);
        const buyerOrders = allOrders.filter(
          (o) => o.buyer_id === user?.id || o.buyer_id === 'buyer-201'
        );
        setOrders(buyerOrders);
        setFeaturedListings(allListings.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }
    loadBuyerData();
  }, [user]);

  const pendingOffersCount = offers.filter((o) => o.status === 'pending').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const totalVolumeKg = orders.reduce((acc, curr) => acc + (curr.quantity_kg || 0), 0);
  const totalSpend = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 p-6 sm:p-8 text-cream-50 shadow-md border border-forest-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-700/80 px-3 py-1 text-xs font-semibold text-gold-300 mb-2 border border-forest-600">
              <Store className="h-3 w-3" /> Direct Procurement Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {user?.full_name || 'Buyer'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-forest-200">
              {user?.business_name || 'Commercial Procurement'} • {user?.location || 'Pune, Maharashtra'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-forest-950 hover:bg-gold-400 transition shadow-xs"
            >
              <ShoppingBag className="h-4 w-4" /> Browse Marketplace
            </Link>
            <Link
              to="/buyer/offers"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-cream-100 hover:bg-forest-700 transition border border-forest-700"
            >
              <Receipt className="h-4 w-4" /> My Offers ({pendingOffersCount})
            </Link>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-6 pt-6 border-t border-forest-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Active Orders</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
              {activeOrdersCount}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">In transit / delivery</span>
          </div>
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Pending Offers</span>
            <span className="text-xl sm:text-2xl font-black text-gold-300 mt-0.5 block">
              {pendingOffersCount}
            </span>
            <span className="text-[10px] text-forest-400 font-medium">Awaiting farmer review</span>
          </div>
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Procured Volume</span>
            <span className="text-xl sm:text-2xl font-black text-cream-100 mt-0.5 block">
              {totalVolumeKg.toLocaleString('en-IN')} <span className="text-xs font-normal">kg</span>
            </span>
            <span className="text-[10px] text-forest-400 font-medium">Total direct fulfillment</span>
          </div>
          <div className="bg-forest-950/40 rounded-xl p-3 border border-forest-800">
            <span className="text-[11px] text-forest-300 block font-medium">Estimated Savings</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5 block">
              ~₹{Math.round(totalSpend * 0.18).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">vs middleman mandi cuts</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/marketplace"
          className="rounded-2xl bg-white p-5 border border-cream-200 shadow-xs hover:border-forest-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center group-hover:bg-forest-600 group-hover:text-white transition">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-forest-950">Produce Catalog</h3>
              <p className="text-xs text-forest-600">Discover fresh harvests directly from growers</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-forest-400 group-hover:text-forest-700 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/prices/current"
          className="rounded-2xl bg-white p-5 border border-cream-200 shadow-xs hover:border-forest-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-forest-950">Current Mandi Rates</h3>
              <p className="text-xs text-forest-600">Live APMC modal benchmarks & market arrivals</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-forest-400 group-hover:text-forest-700 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/prices/future"
          className="rounded-2xl bg-white p-5 border border-cream-200 shadow-xs hover:border-forest-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-forest-950 transition">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-forest-950">Future Price Predictions</h3>
              <p className="text-xs text-forest-600">7-60 day ML price forecasting & buy advisory</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-forest-400 group-hover:text-forest-700 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Recent Offers & Active Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Offers */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-cream-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <div>
              <h3 className="text-base font-black text-forest-950">My Recent Purchase Offers</h3>
              <p className="text-xs text-forest-600">Offers awaiting farmer NetProfit evaluation</p>
            </div>
            <Link
              to="/buyer/offers"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-forest-600">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="py-10 text-center text-forest-600">
              <Receipt className="mx-auto h-8 w-8 text-forest-400 mb-2" />
              <p className="text-xs">No offers submitted yet. Head to Marketplace to place offers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.slice(0, 3).map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-xl bg-cream-50/60 p-3.5 border border-cream-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-forest-950 block">
                      {offer.listing?.produce_name || 'Produce Lot'}
                    </span>
                    <span className="text-forest-600 block mt-0.5">
                      Offered: ₹{offer.offered_price_per_kg}/kg for {offer.quantity_kg.toLocaleString('en-IN')} kg
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={offer.status} />
                    <span className="text-[10px] text-forest-400 block mt-1 capitalize">
                      {offer.pickup_or_delivery}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-cream-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <div>
              <h3 className="text-base font-black text-forest-950">Active Orders & Deliveries</h3>
              <p className="text-xs text-forest-600">Accepted contracts undergoing dispatch</p>
            </div>
            <Link
              to="/orders"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-forest-600">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-forest-600">
              <Package className="mx-auto h-8 w-8 text-forest-400 mb-2" />
              <p className="text-xs">No active orders yet. Once farmers accept your offers, orders appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl bg-cream-50/60 p-3.5 border border-cream-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-forest-950 block">
                      Order #{order.id.slice(0, 8)} • {order.listing?.produce_name || 'Crop Order'}
                    </span>
                    <span className="text-forest-600 block mt-0.5">
                      Total: ₹{order.total_amount.toLocaleString('en-IN')} ({order.quantity_kg} kg @ ₹{order.agreed_price_per_kg}/kg)
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <span className="text-[10px] text-forest-400 block mt-1">
                      {order.created_at?.split('T')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
