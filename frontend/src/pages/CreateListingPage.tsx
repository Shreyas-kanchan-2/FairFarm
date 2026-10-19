import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MapPin, Calendar, Tag, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { produceApi } from '../api/client';
import { ProduceCategory } from '../types';

export const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [produceName, setProduceName] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('vegetables');
  const [description, setDescription] = useState('');
  const [quantityKg, setQuantityKg] = useState('500');
  const [pricePerKg, setPricePerKg] = useState('35');
  const [unit, setUnit] = useState('kg');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [bestBefore, setBestBefore] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [location, setLocation] = useState(user?.location || 'Narayangaon, Junnar, Pune');
  const [latitude, setLatitude] = useState(user?.latitude || 19.1235);
  const [longitude, setLongitude] = useState(user?.longitude || 73.9782);
  const [isOrganic, setIsOrganic] = useState(true);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleImages: Record<ProduceCategory, string> = {
    vegetables:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    fruits:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80',
    grains:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    dairy:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
    spices:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    pulses:
      'https://images.unsplash.com/photo-1585728748178-577c28384c39?w=800&auto=format&fit=crop&q=80',
    oilseeds:
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=80',
  };

  const handleCategoryChange = (cat: ProduceCategory) => {
    setCategory(cat);
    setImageUrl(sampleImages[cat] || sampleImages.vegetables);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produceName || !quantityKg || !pricePerKg) {
      setErrorMsg('Please fill in produce name, quantity, and price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await produceApi.create({
        farmer_id: user?.id || 'farmer-101',
        produce_name: produceName,
        category,
        description,
        quantity_kg: Number(quantityKg),
        available_quantity_kg: Number(quantityKg),
        price_per_kg: Number(pricePerKg),
        unit,
        harvest_date: harvestDate,
        best_before: bestBefore,
        location,
        latitude,
        longitude,
        is_organic: isOrganic,
        image_url: imageUrl,
      });

      navigate('/farmer/listings');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="rounded-2xl bg-white border border-cream-200 p-6 sm:p-8 shadow-sm">
        <div className="border-b border-cream-200 pb-5 mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-800 mb-2">
            <Sparkles className="h-3 w-3" /> Step 1 in Acceptance Lifecycle
          </div>
          <h1 className="text-2xl font-black text-forest-950">List Your Produce on FairFarm</h1>
          <p className="text-xs sm:text-sm text-forest-700 mt-1">
            Publish your crop directly to institutional buyers with transparent price discovery and NetProfit Match.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5">
                Produce / Crop Name *
              </label>
              <input
                type="text"
                required
                value={produceName}
                onChange={(e) => setProduceName(e.target.value)}
                placeholder="e.g. Desi Vine Tomatoes, Basmati Rice"
                className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ProduceCategory)}
                className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600 bg-white"
              >
                <option value="vegetables">Vegetables (सब्जियां)</option>
                <option value="fruits">Fruits (फल)</option>
                <option value="grains">Grains & Cereals (अनाज)</option>
                <option value="dairy">Dairy & Milk (डेयरी)</option>
                <option value="spices">Spices (मसाले)</option>
                <option value="pulses">Pulses & Lentils (दालें)</option>
                <option value="oilseeds">Oilseeds (तिलहन)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity, Price, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5">
                Total Available Quantity *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600 bg-white"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="quintal">Quintal (100 kg)</option>
                <option value="litre">Litre</option>
                <option value="dozen">Dozen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5">
                Target Price per Unit (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-forest-700">₹</span>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="any"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  placeholder="35"
                  className="w-full rounded-lg border border-cream-300 pl-8 pr-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Harvest Date & Best Before */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-forest-600" /> Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-900 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-forest-600" /> Best Before / Shelf Life
              </label>
              <input
                type="date"
                value={bestBefore}
                onChange={(e) => setBestBefore(e.target.value)}
                className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600 bg-white"
              />
            </div>
          </div>

          {/* Row 4: Farm Location */}
          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-forest-600" /> Farm / Dispatch Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Narayangaon, Junnar, Pune"
              className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
            />
            <p className="text-[11px] text-forest-600 mt-1">
              Used by NetProfit Match to compute haulage distances and shared route pooling.
            </p>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1.5">
              Crop Details & Quality Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe variety, grading (A/B), moisture level, harvest freshness..."
              className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
            />
          </div>

          {/* Row 6: Organic Checkbox & Photo preview */}
          <div className="flex items-center justify-between rounded-xl bg-forest-50 p-4 border border-forest-200">
            <div>
              <span className="font-bold text-sm text-forest-950 block">Certified Organic Harvest</span>
              <span className="text-xs text-forest-700 block">
                No synthetic pesticides, chemical fertilizers, or ripening agents used.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cream-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-cream-300 px-5 py-2.5 text-sm font-semibold text-forest-800 hover:bg-cream-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-forest-700 px-6 py-2.5 text-sm font-bold text-cream-50 hover:bg-forest-800 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
