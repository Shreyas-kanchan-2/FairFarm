import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Layers,
  Truck,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { produceApi, offersApi, ordersApi } from '../api/client';
import { ProduceListing, Offer, Order } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [allListings, allOrders] = await Promise.all([
          produceApi.getAll(),
          ordersApi.getAll(),
        ]);

        const farmerListings = allListings.filter(
          (l) => l.farmer_id === user?.id || l.farmer_id === 'farmer-101'
        );
        setListings(farmerListings);

        // Fetch offers for these listings
        const offerPromises = farmerListings.map((l) => offersApi.getByListing(l.id));
        const offersArrays = await Promise.all(offerPromises);
        const allOffers = offersArrays.flat();
        setPendingOffers(allOffers.filter((o) => o.status === 'pending'));

        const farmerOrders = allOrders.filter(
          (o) => o.farmer_id === user?.id || o.farmer_id === 'farmer-101'
        );
        setOrders(farmerOrders);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Metric: Net Revenue Earned
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 p-6 sm:p-8 text-cream-50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-700/80 px-3 py-1 text-xs font-semibold text-gold-300 mb-2 border border-forest-600">
              <Sparkles className="h-3 w-3" /> Farmer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {user?.full_name || 'Farmer'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-forest-200">
              {user?.business_name || 'Patil Organic Farms'} • {user?.location || 'Pune, Maharashtra'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/farmer/listings/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-forest-950 shadow-xs hover:bg-gold-400 transition"
            >
              <Plus className="h-4 w-4" /> {t('createNewListing')}
            </Link>
            <Link
              to="/farmer/transport"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-cream-50 border border-forest-600 hover:bg-forest-600 transition"
            >
              <Truck className="h-4 w-4" /> Pool Transport
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-white p-5 border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-forest-700">
            <span className="text-xs font-semibold uppercase">{t('totalListings')}</span>
            <Layers className="h-5 w-5 text-forest-600" />
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-forest-950">
            {isLoading ? '...' : listings.length}
          </p>
          <p className="mt-1 text-xs text-forest-600">Active produce on market</p>
        </div>

        {/* Metric 2: Pending Offers with Highlighting */}
        <div className="rounded-2xl bg-amber-50/70 p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold uppercase">{t('pendingOffers')}</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-amber-950">
            {isLoading ? '...' : pendingOffers.length}
          </p>
          <p className="mt-1 text-xs text-amber-800 font-medium">Ready for NetProfit ranking</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl bg-white p-5 border border-cream-200 shadow-xs">
          <div className="flex items-center justify-between text-forest-700">
            <span className="text-xs font-semibold uppercase">{t('totalOrders')}</span>
            <Package className="h-5 w-5 text-forest-600" />
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-forest-950">
            {isLoading ? '...' : orders.length}
          </p>
          <p className="mt-1 text-xs text-forest-600">Confirmed direct sales</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl bg-forest-50 p-5 border border-forest-200 shadow-xs">
          <div className="flex items-center justify-between text-forest-700">
            <span className="text-xs font-semibold uppercase">{t('netRevenueEarned')}</span>
            <TrendingUp className="h-5 w-5 text-forest-700" />
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-forest-950">
            ₹{isLoading ? '...' : totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-forest-700">Zero middleman cut</p>
        </div>
      </div>

      {/* Critical Section: Offers Awaiting Review with NetProfit Match Action */}
      <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-cream-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-forest-950 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-forest-700" />
              {t('offersAwaitingReview')}
            </h2>
            <p className="text-xs text-forest-700 mt-0.5">
              Review and rank these offers using the NetProfit algorithm before accepting
            </p>
          </div>
          <span className="text-xs font-bold text-forest-800 bg-forest-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {pendingOffers.length} Offers Pending
          </span>
        </div>

        {pendingOffers.length === 0 ? (
          <div className="py-12 text-center text-forest-700">
            <CheckCircle className="mx-auto h-10 w-10 text-forest-500 mb-2" />
            <p className="text-sm font-semibold text-forest-900">All caught up!</p>
            <p className="text-xs text-forest-600 mt-0.5">
              No pending buyer offers right now. Check back soon or list more produce.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-cream-200">
            {pendingOffers.map((offer) => {
              const matchedListing = listings.find((l) => l.id === offer.listing_id);
              return (
                <div
                  key={offer.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-forest-950 text-sm">
                        {matchedListing?.produce_name || 'Produce Harvest'}
                      </span>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-xs text-forest-700">
                      Buyer: <strong className="text-forest-900">{offer.buyer?.business_name || offer.buyer?.full_name}</strong> •{' '}
                      Offered: <span className="font-bold text-forest-950">₹{offer.offered_price_per_kg}/kg</span> for{' '}
                      <span className="font-bold text-forest-950">{offer.quantity_kg.toLocaleString('en-IN')} kg</span>
                    </p>
                    <p className="text-[11px] text-forest-600">
                      Mode:{' '}
                      {offer.pickup_or_delivery === 'pickup'
                        ? 'Buyer Farm Pickup (₹0 transport)'
                        : `Delivery to ${offer.delivery_location || 'Buyer hub'}`}
                    </p>
                  </div>

                  <Link
                    to={`/farmer/listings/${offer.listing_id}/offers`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2 text-xs font-bold text-cream-50 hover:bg-forest-800 transition shadow-xs self-start sm:self-auto"
                  >
                    Compare via NetProfit Match <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Farmer's Active Listings */}
      <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-forest-950">{t('navMyListings')}</h2>
            <p className="text-xs text-forest-700 mt-0.5">
              Manage your stock and check submitted offers
            </p>
          </div>
          <Link
            to="/farmer/listings"
            className="text-xs font-bold text-forest-800 hover:text-forest-950 hover:underline"
          >
            {t('viewAllListings')} →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-cream-200 p-4 hover:border-forest-400 transition bg-cream-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-forest-950 text-sm sm:text-base">
                      {item.produce_name}
                    </h3>
                    <p className="text-xs text-forest-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs border-t border-cream-200 pt-2.5">
                  <div>
                    <span className="text-forest-600 block text-[10px] uppercase font-semibold">
                      Target Rate
                    </span>
                    <span className="font-bold text-forest-950 text-sm">
                      ₹{item.price_per_kg} / {item.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-forest-600 block text-[10px] uppercase font-semibold text-right">
                      Stock Remaining
                    </span>
                    <span className="font-bold text-forest-950 text-sm">
                      {item.available_quantity_kg.toLocaleString('en-IN')} /{' '}
                      {item.quantity_kg.toLocaleString('en-IN')} kg
                    </span>
                  </div>
                </div>

                {/* Progress bar of available stock */}
                <div className="w-full bg-cream-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-forest-600 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (item.available_quantity_kg / item.quantity_kg) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
                <span className="text-[11px] text-forest-700">
                  {item.is_organic ? '🌱 Certified Organic' : 'Standard Farm Harvest'}
                </span>
                <Link
                  to={`/farmer/listings/${item.id}/offers`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-950 hover:underline"
                >
                  View Offers & NetProfit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
