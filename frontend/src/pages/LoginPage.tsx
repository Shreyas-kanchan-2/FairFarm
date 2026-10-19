import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, UserCheck, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(email.includes('buyer') ? '/marketplace' : '/farmer/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = (role: 'farmer' | 'buyer') => {
    quickLogin(role);
    navigate(role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-cream-50 shadow-md">
            <Sprout className="h-7 w-7 text-gold-300" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-forest-950">Welcome to FairFarm</h2>
          <p className="mt-1 text-xs text-forest-700">
            Sign in to access your direct marketplace dashboard
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="rounded-xl bg-forest-50 p-4 border border-forest-200">
          <p className="text-xs font-bold text-forest-900 mb-2 text-center uppercase tracking-wider">
            Quick 1-Click Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('farmer')}
              className="flex flex-col items-center justify-center rounded-lg bg-forest-700 p-2.5 text-xs font-semibold text-white hover:bg-forest-800 transition active:scale-95"
            >
              <UserCheck className="h-4 w-4 mb-1 text-gold-300" />
              <span>Login as Farmer</span>
              <span className="text-[10px] text-forest-200 font-normal">Patil Organic Farms</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('buyer')}
              className="flex flex-col items-center justify-center rounded-lg bg-forest-800 p-2.5 text-xs font-semibold text-white hover:bg-forest-900 transition active:scale-95"
            >
              <Store className="h-4 w-4 mb-1 text-gold-300" />
              <span>Login as Buyer</span>
              <span className="text-[10px] text-forest-200 font-normal">FreshBite Retailers</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-forest-900 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@fairfarm.in or buyer@fairfarm.in"
                className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-900 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-forest-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-cream-300 pl-10 pr-3.5 py-2 text-sm text-forest-950 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-700 py-2.5 text-sm font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-forest-700">
          New to FairFarm?{' '}
          <Link to="/register" className="font-bold text-forest-800 hover:underline">
            Register your Farm or Business
          </Link>
        </p>
      </div>
    </div>
  );
};
