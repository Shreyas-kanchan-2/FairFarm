import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ShoppingBag,
  X,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { produceApi, offersApi } from '../api/client';
import { ProduceListing, ProduceCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';

export const BuyerMarketplace: React.FC = () => {
  const { user, role, quickLogin } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Submitting Offer
  const [activeListing, setActiveListing] = useState<ProduceListing | null>(null);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [requestedQty, setRequestedQty] = useState('');
  const [pickupOrDelivery, setPickupOrDelivery] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState('');
  const [offerErrorMsg, setOfferErrorMsg] = useState('');

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const data = await produceApi.getAll();
      setListings(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const openOfferModal = (listing: ProduceListing) => {
    // If not currently logged in as buyer, offer 1-click switch
    if (role !== 'buyer') {
      quickLogin('buyer');
    }
    setActiveListing(listing);
    setOfferedPrice(String(listing.price_per_kg));
    setRequestedQty(String(Math.min(100, listing.available_quantity_kg)));
    setPickupOrDelivery('pickup');
    setDeliveryLocation('');
    setMessage('');
    setOfferSuccessMsg('');
    setOfferErrorMsg('');
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;

    const price = Number(offeredPrice);
    const qty = Number(requestedQty);

    if (qty > activeListing.available_quantity_kg) {
      setOfferErrorMsg(
        `Quantity cannot exceed available stock (${activeListing.available_quantity_kg} kg).`
      );
      return;
    }

    if (price <= 0 || qty <= 0) {
      setOfferErrorMsg('Please specify a positive price and quantity.');
      return;
    }

    setIsSubmittingOffer(true);
    setOfferErrorMsg('');

    try {
      await offersApi.submit({
        listing_id: activeListing.id,
        offered_price_per_kg: price,
        quantity_kg: qty,
        pickup_or_delivery: pickupOrDelivery,
        delivery_location: pickupOrDelivery === 'delivery' ? deliveryLocation : 'Farm Gate',
        message,
        estimated_transport_cost: pickupOrDelivery === 'pickup' ? 0 : Math.round(qty * 3.5),
        estimated_loss_percent: pickupOrDelivery === 'pickup' ? 1.5 : 4.5,
      });

      setOfferSuccessMsg(
        `Offer for ${qty} kg at ₹${price}/kg submitted! The farmer will review it in their NetProfit Match comparison.`
      );
      setTimeout(() => {
        setActiveListing(null);
        setOfferSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setOfferErrorMsg(err.message || 'Failed to submit offer.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (item.status === 'sold_out' && item.available_quantity_kg <= 0) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (organicOnly && !item.is_organic) return false;
    if (searchTerm) {
      const matchName = item.produce_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLoc = item.location?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchName && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Marketplace Header */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 via-forest-900 to-forest-800 p-6 sm:p-8 text-cream-50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1 text-xs font-semibold text-gold-300 mb-2 border border-forest-700">
              <Sparkles className="h-3 w-3" /> Direct Farmer Sourcing
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {t('browseProduce')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-forest-200">
              Buy directly from marginal farmers without intermediate commission cuts.
            </p>
          </div>

          <div className="rounded-xl bg-forest-950/60 p-3 border border-forest-800 text-xs text-forest-200 self-start md:self-auto">
            <span className="font-bold text-white block">Active Buyer Mode:</span>
            <span>{user?.business_name || user?.full_name || 'Browsing Guest'}</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="rounded-2xl bg-white border border-cream-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-forest-700 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-cream-300 px-3 py-2 text-xs font-semibold text-forest-900 bg-white focus:border-forest-600 focus:outline-hidden"
            >
              <option value="all">{t('filterAll')}</option>
              <option value="vegetables">{t('filterVegetables')}</option>
              <option value="fruits">{t('filterFruits')}</option>
              <option value="grains">{t('filterGrains')}</option>
              <option value="dairy">{t('filterDairy')}</option>
              <option value="spices">{t('filterSpices')}</option>
              <option value="pulses">{t('filterPulses')}</option>
            </select>
          </div>

          {/* Organic Only toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-forest-900 cursor-pointer self-start md:self-auto">
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              className="rounded text-forest-600 focus:ring-forest-500 h-4 w-4"
            />
            <span>{t('filterOrganicOnly')}</span>
          </label>
        </div>
      </div>

      {/* Produce Listings Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-forest-700">Loading fresh marketplace harvests...</div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
          <ShoppingBag className="mx-auto h-12 w-12 text-forest-400 mb-3" />
          <h3 className="text-lg font-bold text-forest-950">No produce matched your criteria</h3>
          <p className="text-xs text-forest-600 mt-1">
            Try adjusting search terms or clearing the category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-cream-200 overflow-hidden shadow-xs hover:border-forest-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-cream-200 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.produce_name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={item.status} />
                  </div>
                  {item.is_organic && (
                    <span className="absolute top-3 right-3 bg-forest-900/90 text-cream-100 text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                      🌱 Certified Organic
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-forest-950 text-base">{item.produce_name}</h3>
                    <p className="text-xs text-forest-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {item.location}
                    </p>
                  </div>

                  <p className="text-xs text-forest-700 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-cream-50 p-2.5 rounded-xl border border-cream-200">
                    <div>
                      <span className="text-[10px] font-semibold text-forest-600 uppercase block">
                        Target Price
                      </span>
                      <span className="font-bold text-forest-950 text-sm">
                        ₹{item.price_per_kg} / {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-forest-600 uppercase block">
                        Available Stock
                      </span>
                      <span className="font-bold text-forest-950 text-sm">
                        {item.available_quantity_kg.toLocaleString('en-IN')} kg
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-forest-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Harvested: {item.harvest_date}
                    </span>
                    <span>Grower: {item.farmer?.full_name || 'Rameshwar Patil'}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  disabled={item.available_quantity_kg <= 0}
                  onClick={() => openOfferModal(item)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-forest-700 py-2.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{item.available_quantity_kg <= 0 ? 'Sold Out' : 'Submit Purchase Offer'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Submission Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-cream-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-forest-950">
                  Submit Offer for {activeListing.produce_name}
                </h3>
                <p className="text-xs text-forest-700">
                  Available stock: {activeListing.available_quantity_kg} kg • Grower Target: ₹{activeListing.price_per_kg}/kg
                </p>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-lg p-1.5 text-forest-800 hover:bg-cream-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {offerSuccessMsg && (
              <div className="mt-4 rounded-xl bg-forest-50 p-3 text-xs font-semibold text-forest-950 border border-forest-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-forest-700 shrink-0" />
                <span>{offerSuccessMsg}</span>
              </div>
            )}

            {offerErrorMsg && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-900 border border-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
                <span>{offerErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleOfferSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Your Offered Price (₹ / kg) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-bold text-forest-700">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      className="w-full rounded-lg border border-cream-300 pl-7 pr-3 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Quantity Needed (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeListing.available_quantity_kg}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Delivery Terms (Crucial for NetProfit calculation!) */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Logistics & Transport Arrangement *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPickupOrDelivery('pickup')}
                    className={`p-3 rounded-xl border text-left transition ${
                      pickupOrDelivery === 'pickup'
                        ? 'border-forest-600 bg-forest-50 ring-1 ring-forest-600'
                        : 'border-cream-300'
                    }`}
                  >
                    <span className="block font-bold text-xs text-forest-950">
                      Buyer Farm-Gate Pickup
                    </span>
                    <span className="block text-[10px] text-forest-700 mt-0.5">
                      You arrange pickup (₹0 transport for farmer; ranks higher in NetProfit)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickupOrDelivery('delivery')}
                    className={`p-3 rounded-xl border text-left transition ${
                      pickupOrDelivery === 'delivery'
                        ? 'border-forest-600 bg-forest-50 ring-1 ring-forest-600'
                        : 'border-cream-300'
                    }`}
                  >
                    <span className="block font-bold text-xs text-forest-950">
                      Farmer Delivers to Hub
                    </span>
                    <span className="block text-[10px] text-forest-700 mt-0.5">
                      Farmer pays haulage to your warehouse / kitchen
                    </span>
                  </button>
                </div>
              </div>

              {pickupOrDelivery === 'delivery' && (
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">
                    Delivery Hub Location Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. Kalyani Nagar Kitchen, Pune (80 km from farm)"
                    className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Note to Farmer (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify grading preferences, delivery window, or payment terms..."
                  className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                />
              </div>

              {/* Live Gross Amount Calculation */}
              <div className="rounded-xl bg-cream-100 p-3 border border-cream-200 flex items-center justify-between text-xs">
                <span className="text-forest-700 font-medium">Estimated Gross Total:</span>
                <span className="text-base font-black text-forest-950">
                  ₹
                  {(
                    (Number(offeredPrice) || 0) * (Number(requestedQty) || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setActiveListing(null)}
                  className="rounded-lg border border-cream-300 px-4 py-2 text-xs font-semibold text-forest-800 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-5 py-2 text-xs font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingOffer ? 'Submitting...' : 'Send Offer to Farmer'} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
