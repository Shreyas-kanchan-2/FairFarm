import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
    phone?: string;
    location?: string;
    businessName?: string;
  }) => Promise<void>;
  quickLogin: (role: 'farmer' | 'buyer') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session storage
    const savedUser = localStorage.getItem('fairfarm_user');
    const savedToken = localStorage.getItem('fairfarm_token');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken || 'demo-token');
      } catch (err) {
        console.error('Failed to parse cached session:', err);
      }
    } else {
      // Default to demo farmer for immediate exploration
      const defaultDemoFarmer: UserProfile = {
        id: 'farmer-101',
        role: 'farmer',
        full_name: 'Rameshwar Patil',
        phone: '+91 98220 12345',
        business_name: 'Patil Organic Farms',
        location: 'Narayangaon, Junnar, Pune',
        latitude: 19.1235,
        longitude: 73.9782,
        preferred_language: 'en',
      };
      setUser(defaultDemoFarmer);
      setToken('demo-token-patil');
      localStorage.setItem('fairfarm_user', JSON.stringify(defaultDemoFarmer));
      localStorage.setItem('fairfarm_token', 'demo-token-patil');
    }

    // 2. Also listen to live Supabase Auth state if configured
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setToken(session.access_token);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setToken(session.access_token);
          }
        }
      );
      setIsLoading(false);
      return () => subscription.unsubscribe();
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
        if (data.session) {
          setToken(data.session.access_token);
          localStorage.setItem('fairfarm_token', data.session.access_token);
        }
      }

      // Check role by email heuristic or fallback
      const role: UserRole = email.includes('buyer') ? 'buyer' : 'farmer';
      const loggedUser: UserProfile = {
        id: `usr-${Date.now()}`,
        role,
        full_name: email.split('@')[0],
        phone: '+91 98765 43210',
        location: 'Pune, Maharashtra',
      };
      setUser(loggedUser);
      localStorage.setItem('fairfarm_user', JSON.stringify(loggedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
    phone?: string;
    location?: string;
    businessName?: string;
  }) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: data.role,
              full_name: data.fullName,
              phone: data.phone,
            },
          },
        });
        if (error) throw error;
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        role: data.role,
        full_name: data.fullName,
        phone: data.phone,
        business_name: data.businessName,
        location: data.location || 'Pune, Maharashtra',
      };
      setUser(newUser);
      setToken(`token-${newUser.id}`);
      localStorage.setItem('fairfarm_user', JSON.stringify(newUser));
      localStorage.setItem('fairfarm_token', `token-${newUser.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick switch for live hackathon jury testing!
  const quickLogin = (targetRole: 'farmer' | 'buyer') => {
    if (targetRole === 'farmer') {
      const demoFarmer: UserProfile = {
        id: 'farmer-101',
        role: 'farmer',
        full_name: 'Rameshwar Patil (Farmer)',
        phone: '+91 98220 12345',
        business_name: 'Patil Organic Farms',
        location: 'Narayangaon, Junnar, Pune',
        latitude: 19.1235,
        longitude: 73.9782,
        preferred_language: 'en',
      };
      setUser(demoFarmer);
      setToken('token-patil');
      localStorage.setItem('fairfarm_user', JSON.stringify(demoFarmer));
      localStorage.setItem('fairfarm_token', 'token-patil');
    } else {
      const demoBuyer: UserProfile = {
        id: 'buyer-201',
        role: 'buyer',
        full_name: 'Sandeep Khurana (Buyer)',
        phone: '+91 98110 54321',
        business_name: 'FreshBite Retailers',
        business_type: 'retailer',
        location: 'Shivajinagar, Pune',
        latitude: 18.5314,
        longitude: 73.8446,
        preferred_language: 'en',
      };
      setUser(demoBuyer);
      setToken('token-khurana');
      localStorage.setItem('fairfarm_user', JSON.stringify(demoBuyer));
      localStorage.setItem('fairfarm_token', 'token-khurana');
    }
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    localStorage.removeItem('fairfarm_user');
    localStorage.removeItem('fairfarm_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
