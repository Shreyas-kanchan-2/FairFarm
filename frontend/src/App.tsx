import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/Guards';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BuyerMarketplace } from './pages/BuyerMarketplace';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { MyListingsPage } from './pages/MyListingsPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { ListingOffersPage } from './pages/ListingOffersPage';
import { BuyerOffersPage } from './pages/BuyerOffersPage';
import { OrdersPage } from './pages/OrdersPage';
import { TransportHubPage } from './pages/TransportHubPage';

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-50 text-forest-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<BuyerMarketplace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/orders" element={<OrdersPage />} />

              {/* Farmer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
                <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                <Route path="/farmer/listings" element={<MyListingsPage />} />
                <Route path="/farmer/listings/new" element={<CreateListingPage />} />
                <Route path="/farmer/listings/:id/offers" element={<ListingOffersPage />} />
                <Route path="/farmer/transport" element={<TransportHubPage />} />
              </Route>

              {/* Buyer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
                <Route path="/buyer/offers" element={<BuyerOffersPage />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
