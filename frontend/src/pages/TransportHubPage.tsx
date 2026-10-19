import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { transportApi } from '../api/client';
import { TransportRequest, TransportMatch } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const TransportHubPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [matches, setMatches] = useState<TransportMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);

  // New Request Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [originLocation, setOriginLocation] = useState(user?.location || 'Narayangaon, Junnar, Pune');
  const [originLat, setOriginLat] = useState('19.1235');
  const [originLng, setOriginLng] = useState('73.9782');
  const [destLocation, setDestLocation] = useState('Gultekdi Market Yard, Pune');
  const [destLat, setDestLat] = useState('18.4967');
  const [destLng, setDestLng] = useState('73.8647');
  const [quantityKg, setQuantityKg] = useState('400');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await transportApi.getRequests();
      setRequests(data);
      if (data.length > 0 && !selectedRequest) {
        setSelectedRequest(data[0]);
        findMatchesFor(data[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const findMatchesFor = async (reqId: string) => {
    setIsMatching(true);
    try {
      const found = await transportApi.findMatches(reqId);
      setMatches(found);
    } finally {
      setIsMatching(false);
    }
  };

  const handleSelectRequest = (req: TransportRequest) => {
    setSelectedRequest(req);
    findMatchesFor(req.id);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await transportApi.create({
        farmer_id: user?.id || 'farmer-101',
        origin_location: originLocation,
        origin_lat: Number(originLat),
        origin_lng: Number(originLng),
        destination_location: destLocation,
        destination_lat: Number(destLat),
        destination_lng: Number(destLng),
        quantity_kg: Number(quantityKg),
        preferred_date: preferredDate,
      });

      setShowCreateForm(false);
      setSuccessMessage('Shared transport request published! Searching compatible routes...');
      await loadRequests();
      handleSelectRequest(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 p-6 sm:p-8 text-cream-50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-700/80 px-3 py-1 text-xs font-semibold text-gold-300 mb-2 border border-forest-600">
              <Truck className="h-3.5 w-3.5" /> Shared Logistics Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {t('sharedTransportTitle')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-forest-200 max-w-2xl leading-relaxed">
              Combine smaller crop dispatches with neighboring farmers traveling to the same city mandi.
              Cut individual vehicle hire tariffs by up to 50% using Haversine route matching.
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-forest-950 shadow-xs hover:bg-gold-400 transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> {showCreateForm ? 'Close Form' : t('createTransportReq')}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-forest-50 p-4 border border-forest-300 text-forest-950 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Create Transport Request Form */}
      {showCreateForm && (
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-forest-950 mb-1">
            Publish New Shared Route Request
          </h2>
          <p className="text-xs text-forest-700 mb-4">
            Enter pickup point, destination, cargo weight, and date to match nearby farmers.
          </p>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-forest-600" /> Origin Farm Location *
                </label>
                <input
                  type="text"
                  required
                  value={originLocation}
                  onChange={(e) => setOriginLocation(e.target.value)}
                  placeholder="e.g. Narayangaon, Junnar, Pune"
                  className="w-full rounded-lg border border-cream-300 px-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-forest-600" /> Destination Market / Mandi *
                </label>
                <input
                  type="text"
                  required
                  value={destLocation}
                  onChange={(e) => setDestLocation(e.target.value)}
                  placeholder="e.g. Gultekdi Market Yard, Pune"
                  className="w-full rounded-lg border border-cream-300 px-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1">
                  Cargo Weight to Transport (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  step="any"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="400"
                  className="w-full rounded-lg border border-cream-300 px-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-forest-600" /> Target Dispatch Date *
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-lg border border-cream-300 px-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-cream-300 px-4 py-2 text-xs font-semibold text-forest-800 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-5 py-2 text-xs font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Find Compatible Farmers'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Layout: Left Requests List / Right Route Matching Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Farmer's Open Requests */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-forest-950">Active Pooling Requests</h3>
            <span className="text-xs text-forest-700">{requests.length} Requests</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-forest-700">Loading transport routes...</div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl bg-white border border-cream-200 p-8 text-center text-forest-700">
              <Truck className="mx-auto h-10 w-10 text-forest-400 mb-2" />
              <p className="text-sm font-semibold text-forest-900">No transport requests yet</p>
              <p className="text-xs text-forest-600 mt-0.5">
                Post your delivery route above to discover nearby farmers heading along the same corridor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`cursor-pointer rounded-2xl border p-4.5 transition-all shadow-xs ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50/60 ring-1 ring-forest-600'
                        : 'border-cream-200 bg-white hover:border-forest-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-forest-950">
                        {req.quantity_kg.toLocaleString('en-IN')} kg Cargo
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="space-y-1.5 text-xs text-forest-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-forest-600 shrink-0" />
                        <span className="truncate">From: {req.origin_location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">To: {req.destination_location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-forest-600 pt-1">
                        <Calendar className="h-3 w-3" /> Target Date: {req.preferred_date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Route Matches for Selected Request */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-forest-950">
              Matched Nearby Routes ({matches.length})
            </h3>
            <span className="text-xs text-forest-700">Ranked by Spatial Proximity</span>
          </div>

          {isMatching ? (
            <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
              Computing Haversine distances to neighboring farms...
            </div>
          ) : !selectedRequest ? (
            <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
              Select a request on the left to inspect route matches.
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
              <Users className="mx-auto h-10 w-10 text-forest-400 mb-2" />
              <p className="text-sm font-semibold text-forest-900">No compatible routes found yet</p>
              <p className="text-xs text-forest-600 mt-0.5">
                We alert neighboring farmers within 25 km when your request matches their delivery timing.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {matches.map((match, idx) => {
                const isBest = idx === 0;
                return (
                  <div
                    key={match.match_id}
                    className={`rounded-2xl border p-5 shadow-xs transition ${
                      isBest
                        ? 'border-forest-500 bg-white ring-1 ring-forest-500'
                        : 'border-cream-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-forest-950 text-sm sm:text-base">
                            {match.farmer_name}
                          </h4>
                          {isBest && (
                            <span className="text-[10px] font-bold bg-forest-600 text-cream-50 px-2 py-0.5 rounded-sm">
                              Top Route Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-forest-700 mt-0.5">
                          Cargo: {match.quantity_kg.toLocaleString('en-IN')} kg • Date: {match.preferred_date}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-forest-600 block">
                          Proximity Score
                        </span>
                        <span className="text-sm font-black text-forest-950">
                          {match.match_score} pts
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-forest-50 p-2.5 border border-forest-200">
                        <span className="text-forest-700 text-[10px] font-medium block">
                          Origin Distance
                        </span>
                        <span className="font-bold text-forest-950 text-sm">
                          ~{match.origin_distance_km} km away
                        </span>
                        <span className="text-[10px] text-forest-600 block truncate">
                          {match.origin_location}
                        </span>
                      </div>

                      <div className="rounded-xl bg-cream-100 p-2.5 border border-cream-200">
                        <span className="text-forest-700 text-[10px] font-medium block">
                          Destination Distance
                        </span>
                        <span className="font-bold text-forest-950 text-sm">
                          ~{match.dest_distance_km} km away
                        </span>
                        <span className="text-[10px] text-forest-600 block truncate">
                          {match.destination_location}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                        <TrendingDown className="h-4 w-4" />
                        <span>Estimated 35% to 50% vehicle cost reduction</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `Connect request sent to ${match.farmer_name}! Phone contact and shared vehicle schedule shared.`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-forest-700 px-3.5 py-1.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 shadow-xs"
                      >
                        Connect & Pool <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
