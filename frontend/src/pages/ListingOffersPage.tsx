import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { produceApi, offersApi } from '../api/client';
import { ProduceListing, Offer, NetProfitResult } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { NetProfitBreakdown } from '../components/NetProfitBreakdown';
import { useLanguage } from '../context/LanguageContext';

export const ListingOffersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [netProfitResults, setNetProfitResults] = useState<NetProfitResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [currListing, currOffers, npResults] = await Promise.all([
        produceApi.getById(id),
        offersApi.getByListing(id),
        offersApi.getNetProfit(id),
      ]);
      setListing(currListing);
      setOffers(currOffers);
      setNetProfitResults(npResults);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Atomic offer acceptance handler
  const handleAcceptOffer = async (offerId: string) => {
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await offersApi.accept(offerId);
      setSuccessMessage(
        `Offer successfully accepted! Order #${result.order.id} has been created with agreed amount of ₹${result.order.total_amount.toLocaleString('en-IN')}. Remaining produce stock: ${result.remaining_quantity} kg.`
      );
      // Refresh offers and inventory state
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not accept offer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setIsProcessing(true);
    try {
      await offersApi.reject(offerId);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reject offer.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-forest-700">
        Evaluating offers and computing NetProfit rankings...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-forest-700">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/farmer/listings')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Listings
      </button>

      {/* Listing Overview Header */}
      <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-forest-950">
                {listing.produce_name}
              </h1>
              <StatusBadge status={listing.status} />
            </div>
            <p className="text-xs text-forest-600 flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" /> {listing.location}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-cream-50 p-3 rounded-xl border border-cream-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-forest-600 block">
                Target Price
              </span>
              <span className="font-bold text-forest-950 text-sm">
                ₹{listing.price_per_kg} / {listing.unit}
              </span>
            </div>
            <div className="border-l border-cream-300 pl-4">
              <span className="text-[10px] uppercase font-semibold text-forest-600 block">
                Available Stock
              </span>
              <span className="font-bold text-forest-950 text-sm">
                {listing.available_quantity_kg.toLocaleString('en-IN')} /{' '}
                {listing.quantity_kg.toLocaleString('en-IN')} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="rounded-xl bg-forest-50 p-4 border border-forest-300 text-forest-950 text-xs font-medium flex items-start gap-2.5 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-forest-700 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <p className="font-bold text-forest-950">Offer Acceptance Successful</p>
            <p className="mt-0.5">{successMessage}</p>
            <Link
              to="/orders"
              className="mt-2 inline-block font-bold text-forest-800 underline hover:text-forest-950"
            >
              View in Orders Dashboard →
            </Link>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-300 text-rose-900 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* NetProfit Algorithm Explanation Header */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 p-6 text-cream-50 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 text-gold-300 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              NetProfit Match Evaluation Engine
            </h2>
            <p className="text-xs text-forest-200 mt-1 leading-relaxed">
              Every buyer offer has been analyzed against actual haulage distance, vehicle hiring tariffs,
              transit damage percentages, and platform handling fees. The list is automatically sorted
              by real net take-home earnings so you never accept a misleading offer.
            </p>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-forest-950">
            Submitted Buyer Offers ({offers.length})
          </h3>
          <span className="text-xs text-forest-700">Sorted by Highest Net Earnings</span>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
            <HelpCircle className="mx-auto h-10 w-10 text-forest-400 mb-2" />
            <p className="text-sm font-semibold text-forest-900">No offers received yet</p>
            <p className="text-xs text-forest-600 mt-0.5">
              Buyers in Pune, Bangalore, and regional mandis can submit offers directly from the marketplace.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {netProfitResults.map((result) => {
              const matchedOffer = offers.find((o) => o.id === result.offer_id);
              if (!matchedOffer) return null;

              return (
                <NetProfitBreakdown
                  key={result.offer_id}
                  result={result}
                  offer={matchedOffer}
                  onAccept={handleAcceptOffer}
                  onReject={handleRejectOffer}
                  isProcessing={isProcessing}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
