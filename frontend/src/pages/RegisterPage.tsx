import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, User, Phone, MapPin, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('farmer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        role,
        fullName,
        phone,
        businessName,
        location,
      });
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-cream-50 shadow-md">
            <Sprout className="h-7 w-7 text-gold-300" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-forest-950">Create your FairFarm Account</h2>
          <p className="mt-1 text-xs text-forest-700">
            Direct market access without middlemen for growers and buyers
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div>
          <label className="block text-xs font-bold text-forest-900 mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`p-3.5 rounded-xl border text-left transition ${
                role === 'farmer'
                  ? 'border-forest-600 bg-forest-50/70 ring-1 ring-forest-600'
                  : 'border-cream-300 hover:border-forest-300'
              }`}
            >
              <span className="block font-bold text-sm text-forest-950">Farmer / Grower</span>
              <span className="block text-[11px] text-forest-700 mt-0.5">
                List harvest, compare offers via NetProfit Match, pool transport
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-3.5 rounded-xl border text-left transition ${
                role === 'buyer'
                  ? 'border-forest-600 bg-forest-50/70 ring-1 ring-forest-600'
                  : 'border-cream-300 hover:border-forest-300'
              }`}
            >
              <span className="block font-bold text-sm text-forest-950">Institutional Buyer</span>
              <span className="block text-[11px] text-forest-700 mt-0.5">
                Retailer, hotel, restaurant, or bulk distributor
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-forest-900 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rameshwar Patil"
                className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forest-900 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-900 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-forest-900 mb-1">
                {role === 'farmer' ? 'Farm / Holding Name' : 'Company / Business Name'}
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={role === 'farmer' ? 'Patil Organic Farms' : 'FreshBite Supermarkets'}
                  className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-900 mb-1">
                Location (District / City)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Narayangaon, Pune"
                  className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-900 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-700 py-3 text-sm font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-forest-700">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-forest-800 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
