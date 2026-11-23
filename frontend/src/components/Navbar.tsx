import React, { useState, useEffect } from 'react';
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
  Receipt,
  TrendingUp,
  Sparkles,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { VoiceAssistantModal } from './VoiceAssistantModal';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on location change or Escape key
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const isActive = (path: string) => {
    if (path === '/farmer/dashboard' && location.pathname === '/farmer/dashboard') return true;
    if (path === '/buyer/dashboard' && location.pathname === '/buyer/dashboard') return true;
    if (path === '/marketplace' && location.pathname === '/marketplace') return true;
    if (path === '/farmer/listings' && location.pathname.startsWith('/farmer/listings')) return true;
    if (path === '/farmer/transport' && location.pathname === '/farmer/transport') return true;
    if (path === '/buyer/offers' && location.pathname === '/buyer/offers') return true;
    if (path === '/orders' && location.pathname === '/orders') return true;
    if (path === '/prices/current' && location.pathname === '/prices/current') return true;
    if (path === '/prices/future' && location.pathname === '/prices/future') return true;
    return location.pathname === path;
  };

  const sidebarItemClass = (path: string) =>
    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
      isActive(path)
        ? 'bg-forest-800 text-gold-300 border-l-4 border-gold-400 shadow-xs'
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

            {/* Right: Language Selector, Voice AI, Logged-in User Profile, and Hamburger Button */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-forest-950/70 rounded-lg px-2 py-1.5 text-xs text-forest-200 border border-forest-800">
                <Languages className="h-3.5 w-3.5 text-gold-400" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent text-cream-100 text-xs font-medium focus:outline-hidden cursor-pointer"
                  aria-label="Select Language"
                >
                  <option value="en" className="bg-forest-900 text-white">English</option>
                  <option value="hi" className="bg-forest-900 text-white">हिन्दी</option>
                  <option value="kn" className="bg-forest-900 text-white">ಕನ್ನಡ</option>
                </select>
              </div>

              {/* Voice AI Button */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-cream-100 hover:bg-forest-700 hover:text-white transition shadow-xs border border-forest-700 cursor-pointer"
                title="Voice Assistant"
              >
                <Mic className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
                <span className="hidden sm:inline">Voice AI</span>
              </button>

              {/* User Profile Info */}
              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-forest-800">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-cream-100 leading-tight truncate max-w-[140px]">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] text-gold-300 font-semibold capitalize leading-none mt-0.5">
                      {user.role}
                    </p>
                  </div>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-800 text-forest-200 border border-forest-700 shadow-2xs"
                    title={`${user.full_name} (${user.role})`}
                  >
                    <User className="h-4 w-4 text-gold-300" />
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-forest-800">
                  <Link
                    to="/login"
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cream-100 hover:bg-forest-800 transition"
                  >
                    {t('navLogin')}
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-gold-500 px-2.5 py-1.5 text-xs font-bold text-forest-950 hover:bg-gold-400 transition shadow-xs"
                  >
                    {t('navRegister')}
                  </Link>
                </div>
              )}

              {/* Hamburger Sidebar Trigger Button (☰) */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center p-2 rounded-xl bg-forest-800 text-cream-100 hover:bg-forest-700 hover:text-white transition border border-forest-700 focus:outline-hidden shadow-xs cursor-pointer"
                aria-label="Open Navigation Sidebar"
                title="Open Navigation Menu"
              >
                <Menu className="h-5 w-5 text-gold-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Right-Side Sliding Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Right-Side Sliding Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[300px] sm:w-[320px] max-w-[85vw] bg-forest-900 border-l border-forest-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-forest-800 flex items-center justify-between bg-forest-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 text-gold-300 shadow-md">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black text-white block leading-tight">
                FairFarm Menu
              </span>
              <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider block">
                {role === 'farmer' ? 'Farmer Portal' : role === 'buyer' ? 'Buyer Portal' : 'Marketplace Access'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-xl p-2 text-forest-300 hover:bg-forest-800 hover:text-white transition cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {/* Authenticated Farmer Sidebar Options (Order 1 through 7) */}
          {role === 'farmer' && (
            <>
              {/* 1. Dashboard */}
              <Link
                to="/farmer/dashboard"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/farmer/dashboard')}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4 text-gold-400" />
                  <span>{t('navDashboard')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 2. Marketplace */}
              <Link
                to="/marketplace"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/marketplace')}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="h-4 w-4 text-gold-400" />
                  <span>{t('navMarketplace')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 3. My Listings */}
              <Link
                to="/farmer/listings"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/farmer/listings')}
              >
                <span className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-gold-400" />
                  <span>{t('navMyListings')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 4. Shared Transport */}
              <Link
                to="/farmer/transport"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/farmer/transport')}
              >
                <span className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-gold-400" />
                  <span>{t('navTransport')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 5. Orders */}
              <Link
                to="/orders"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/orders')}
              >
                <span className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-gold-400" />
                  <span>{t('navOrders')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 6. Current Price */}
              <Link
                to="/prices/current"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/prices/current')}
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-gold-400" />
                  <span>{t('navCurrentPrice')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 7. Estimated Future Price */}
              <Link
                to="/prices/future"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/prices/future')}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <span>{t('navEstimatedFuturePrice')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>
            </>
          )}

          {/* Authenticated Buyer Sidebar Options (Order 1 through 6) */}
          {role === 'buyer' && (
            <>
              {/* 1. Dashboard */}
              <Link
                to="/buyer/dashboard"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/buyer/dashboard')}
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4 text-gold-400" />
                  <span>{t('navDashboard')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 2. Marketplace */}
              <Link
                to="/marketplace"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/marketplace')}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="h-4 w-4 text-gold-400" />
                  <span>{t('navMarketplace')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 3. My Offers */}
              <Link
                to="/buyer/offers"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/buyer/offers')}
              >
                <span className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-gold-400" />
                  <span>{t('navMyOffers')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 4. Orders */}
              <Link
                to="/orders"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/orders')}
              >
                <span className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-gold-400" />
                  <span>{t('navOrders')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 5. Current Price */}
              <Link
                to="/prices/current"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/prices/current')}
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-gold-400" />
                  <span>{t('navCurrentPrice')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              {/* 6. Estimated Future Price */}
              <Link
                to="/prices/future"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/prices/future')}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <span>{t('navEstimatedFuturePrice')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>
            </>
          )}

          {/* Unauthenticated Guest Sidebar Options */}
          {!user && (
            <>
              <Link
                to="/marketplace"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/marketplace')}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="h-4 w-4 text-gold-400" />
                  <span>{t('navMarketplace')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              <Link
                to="/prices/current"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/prices/current')}
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-gold-400" />
                  <span>{t('navCurrentPrice')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              <Link
                to="/prices/future"
                onClick={() => setIsSidebarOpen(false)}
                className={sidebarItemClass('/prices/future')}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-gold-400" />
                  <span>{t('navEstimatedFuturePrice')}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-forest-400" />
              </Link>

              <div className="pt-4 border-t border-forest-800 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-forest-800 text-cream-100 text-xs font-bold hover:bg-forest-700 transition"
                >
                  <User className="h-3.5 w-3.5" /> {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 text-forest-950 text-xs font-black hover:bg-gold-400 transition"
                >
                  <Sprout className="h-3.5 w-3.5" /> {t('navRegister')}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Footer with Logged In User Profile and Logout */}
        {user && (
          <div className="p-4 border-t border-forest-800 bg-forest-950/70">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-forest-300 truncate">
                  {user.business_name || user.location || user.role}
                </p>
              </div>
              <span className="rounded-md bg-forest-800 px-2 py-0.5 text-[10px] font-bold text-gold-300 capitalize border border-forest-700">
                {user.role}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                setIsSidebarOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-forest-800/80 text-rose-300 text-xs font-semibold hover:bg-rose-950/40 hover:text-rose-200 transition border border-forest-800 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t('navLogout')}</span>
            </button>
          </div>
        )}
      </aside>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </>
  );
};
