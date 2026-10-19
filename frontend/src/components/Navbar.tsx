import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sprout,
  Mic,
  Languages,
  Menu,
  X,
  User,
  ShoppingBag,
  LayoutDashboard,
  Truck,
  Package,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { VoiceAssistantModal } from './VoiceAssistantModal';

export const Navbar: React.FC = () => {
  const { user, role, quickLogin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const navLinkClass = (path: string) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition ${
      isActive(path)
        ? 'bg-forest-800 text-cream-50 font-semibold'
        : 'text-cream-100 hover:bg-forest-800/60 hover:text-white'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-forest-900 border-b border-forest-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-cream-50 shadow-md group-hover:bg-forest-500 transition">
                  <Sprout className="h-6 w-6 text-gold-300" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-white">
                    FairFarm
                  </span>
                  <span className="hidden sm:block text-[10px] text-forest-200">
                    Direct Market Access
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/marketplace" className={navLinkClass('/marketplace')}>
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4" /> {t('navMarketplace')}
                </span>
              </Link>

              {role === 'farmer' && (
                <>
                  <Link to="/farmer/dashboard" className={navLinkClass('/farmer/dashboard')}>
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="h-4 w-4" /> {t('navDashboard')}
                    </span>
                  </Link>
                  <Link to="/farmer/listings" className={navLinkClass('/farmer/listings')}>
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4" /> {t('navMyListings')}
                    </span>
                  </Link>
                  <Link to="/farmer/transport" className={navLinkClass('/farmer/transport')}>
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4" /> {t('navTransport')}
                    </span>
                  </Link>
                </>
              )}

              {role === 'buyer' && (
                <Link to="/buyer/offers" className={navLinkClass('/buyer/offers')}>
                  <span className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> {t('navMyOffers')}
                  </span>
                </Link>
              )}

              {user && (
                <Link to="/orders" className={navLinkClass('/orders')}>
                  <span className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> {t('navOrders')}
                  </span>
                </Link>
              )}
            </nav>

            {/* Right: Trilingual Selector, Voice AI, Role Switcher, Auth */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-forest-950/70 rounded-lg px-2 py-1 text-xs text-forest-200 border border-forest-800">
                <Languages className="h-3.5 w-3.5 text-gold-400" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent text-cream-100 text-xs font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="en" className="bg-forest-900 text-white">English</option>
                  <option value="hi" className="bg-forest-900 text-white">हिन्दी (Hindi)</option>
                  <option value="kn" className="bg-forest-900 text-white">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>

              {/* Voice AI Button */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-cream-100 hover:bg-forest-700 hover:text-white transition shadow-xs border border-forest-700"
              >
                <Mic className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
                <span>Voice AI</span>
              </button>

              {/* Quick Role Switcher for Hackathon Demonstrations */}
              <div className="flex items-center rounded-lg bg-forest-950 p-1 border border-forest-800">
                <button
                  type="button"
                  onClick={() => quickLogin('farmer')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    role === 'farmer'
                      ? 'bg-forest-600 text-white shadow-xs'
                      : 'text-forest-300 hover:text-white'
                  }`}
                  title="Switch to Farmer profile"
                >
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('buyer')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    role === 'buyer'
                      ? 'bg-forest-600 text-white shadow-xs'
                      : 'text-forest-300 hover:text-white'
                  }`}
                  title="Switch to Buyer profile"
                >
                  Buyer
                </button>
              </div>

              {/* User Profile / Auth */}
              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-forest-800">
                  <div className="text-right">
                    <p className="text-xs font-bold text-cream-100">{user.full_name}</p>
                    <p className="text-[10px] text-forest-300 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-lg p-1.5 text-forest-300 hover:bg-forest-800 hover:text-white transition"
                    title={t('navLogout')}
                  >
                    <User className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-cream-100 hover:bg-forest-800 transition"
                  >
                    {t('navLogin')}
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-bold text-forest-950 hover:bg-gold-400 transition"
                  >
                    {t('navRegister')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="rounded-lg bg-forest-800 p-2 text-gold-400"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-cream-100 hover:bg-forest-800"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-forest-800 bg-forest-900 px-4 pt-3 pb-6 space-y-3">
            {/* Language & Role Switcher in Mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-forest-800">
              <div className="flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-gold-400" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-forest-950 text-cream-100 text-xs rounded-md px-2 py-1 border border-forest-800"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="kn">ಕನ್ನಡ</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-forest-950 p-1 rounded-lg">
                <button
                  onClick={() => {
                    quickLogin('farmer');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1 text-xs rounded-md font-semibold ${
                    role === 'farmer' ? 'bg-forest-600 text-white' : 'text-forest-300'
                  }`}
                >
                  Farmer
                </button>
                <button
                  onClick={() => {
                    quickLogin('buyer');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1 text-xs rounded-md font-semibold ${
                    role === 'buyer' ? 'bg-forest-600 text-white' : 'text-forest-300'
                  }`}
                >
                  Buyer
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-1">
              <Link
                to="/marketplace"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cream-100 hover:bg-forest-800"
              >
                {t('navMarketplace')}
              </Link>

              {role === 'farmer' && (
                <>
                  <Link
                    to="/farmer/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-cream-100 hover:bg-forest-800"
                  >
                    {t('navDashboard')}
                  </Link>
                  <Link
                    to="/farmer/listings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-cream-100 hover:bg-forest-800"
                  >
                    {t('navMyListings')}
                  </Link>
                  <Link
                    to="/farmer/transport"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-cream-100 hover:bg-forest-800"
                  >
                    {t('navTransport')}
                  </Link>
                </>
              )}

              {role === 'buyer' && (
                <Link
                  to="/buyer/offers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-cream-100 hover:bg-forest-800"
                >
                  {t('navMyOffers')}
                </Link>
              )}

              {user && (
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-cream-100 hover:bg-forest-800"
                >
                  {t('navOrders')}
                </Link>
              )}
            </div>

            {/* User logout */}
            {user && (
              <div className="pt-3 border-t border-forest-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user.full_name}</p>
                  <p className="text-xs text-forest-300 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-300 hover:underline"
                >
                  {t('navLogout')}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </>
  );
};
