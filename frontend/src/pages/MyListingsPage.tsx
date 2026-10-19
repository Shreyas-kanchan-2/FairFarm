import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, Layers, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { produceApi, offersApi } from '../api/client';
import { ProduceListing, Offer } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [offersMap, setOffersMap] = useState<Record<string, Offer[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const all = await produceApi.getAll();
        const farmerListings = all.filter(
          (l) => l.farmer_id === user?.id || l.farmer_id === 'farmer-101'
        );
        setListings(farmerListings);

        const map: Record<string, Offer[]> = {};
        for (const l of farmerListings) {
          const offers = await offersApi.getByListing(l.id);
          map[l.id] = offers;
        }
        setOffersMap(map);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-forest-950">My Produce Listings</h1>
          <p className="text-xs sm:text-sm text-forest-700 mt-0.5">
            Manage your harvest listings, track buyer offers, and evaluate net returns.
          </p>
        </div>

        <Link
          to="/farmer/listings/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-cream-50 hover:bg-forest-800 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add New Produce
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-forest-700">Loading your produce...</div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-forest-400 mb-3" />
          <h3 className="text-lg font-bold text-forest-950">No crops listed yet</h3>
          <p className="text-xs text-forest-700 mt-1 max-w-sm mx-auto">
            List your first produce to start receiving offers directly from verified retailers and hotels.
          </p>
          <Link
            to="/farmer/listings/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-5 py-2.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition"
          >
            <Plus className="h-4 w-4" /> Add Produce Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const offers = offersMap[item.id] || [];
            const pendingCount = offers.filter((o) => o.status === 'pending').length;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-cream-200 overflow-hidden shadow-xs hover:border-forest-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-cream-200 overflow-hidden">
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
                        <MapPin className="h-3 w-3" /> {item.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-cream-50 p-2.5 rounded-xl border border-cream-200">
                      <div>
                        <span className="text-[10px] font-semibold text-forest-600 uppercase block">
                          Target Rate
                        </span>
                        <span className="font-bold text-forest-950 text-sm">
                          ₹{item.price_per_kg} / {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-forest-600 uppercase block">
                          Stock Available
                        </span>
                        <span className="font-bold text-forest-950 text-sm">
                          {item.available_quantity_kg.toLocaleString('en-IN')} /{' '}
                          {item.quantity_kg.toLocaleString('en-IN')} kg
                        </span>
                      </div>
                    </div>

                    {/* Stock level bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-forest-700 mb-1">
                        <span>Stock Progress</span>
                        <span>
                          {Math.round((item.available_quantity_kg / item.quantity_kg) * 100)}% Available
                        </span>
                      </div>
                      <div className="w-full bg-cream-200 rounded-full h-1.5">
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

                    <div className="text-[11px] text-forest-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Harvested: {item.harvest_date}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/farmer/listings/${item.id}/offers`}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-forest-700 py-2.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition shadow-xs"
                  >
                    <TrendingUp className="h-4 w-4 text-gold-300" />
                    <span>Compare Offers ({pendingCount} pending)</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
