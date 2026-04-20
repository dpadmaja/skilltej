import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';

// Pages
import HomePage from './pages/HomePage';
import KidsPage from './pages/KidsPage';
import ProPage from './pages/ProPage';
import CertifyPage from './pages/CertifyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import KidsLoginPage from './pages/KidsLoginPage';
import KidsSignupPage from './pages/KidsSignupPage';
import ProLoginPage from './pages/ProLoginPage';
import ProSignupPage from './pages/ProSignupPage';
import CertifyLoginPage from './pages/CertifyLoginPage';
import CertifySignupPage from './pages/CertifySignupPage';
import DashboardPage from './pages/DashboardPage';
import KidsDashboardPage from './pages/KidsDashboardPage';
import ProDashboardPage from './pages/ProDashboardPage';
import CertificationDetailsPage from './pages/CertificationDetailsPage';
import PaymentPage from './pages/PaymentPage';
import ExamPage from './pages/ExamPage';
import ResultsPage from './pages/ResultsPage';
import SkillWalletPage from './pages/SkillWalletPage';
import PublicSkillWalletPage from './pages/PublicSkillWalletPage';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Services
import { authService, adminService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState('certify');

  // Detect product from current URL path
  const detectProduct = () => {
    const path = window.location.pathname;
    if (path.includes('/kids')) return 'kids';
    if (path.includes('/pro')) return 'pro';
    return 'certify';
  };

  useEffect(() => {
    // Update product when route changes
    setCurrentProduct(detectProduct());
  }, []);

  useEffect(() => {
    // Initialize app - seed database and check auth
    const initializeApp = async () => {
      try {
        // Try to seed the database (won't duplicate if already seeded)
        await adminService.seedData().catch(err => {
          // Seeding might fail if already seeded, which is fine
          console.debug('Seed data request completed');
        });
      } catch (error) {
        console.debug('Initialization error:', error);
      }

      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} onLogout={handleLogout} product={currentProduct} />}
        <Routes>
          {/* Home Page - accessible to everyone */}
          <Route path="/" element={<HomePage />} />

          {/* Product Pages - accessible to everyone */}
          <Route path="/kids" element={<KidsPage />} />
          <Route path="/pro" element={<ProPage />} />
          <Route path="/certify" element={<CertifyPage />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/signup" element={<SignupPage setUser={setUser} />} />
          
          {/* Product-Specific Auth Routes */}
          <Route path="/kids-login" element={<KidsLoginPage setUser={setUser} />} />
          <Route path="/kids-signup" element={<KidsSignupPage setUser={setUser} />} />
          <Route path="/pro-login" element={<ProLoginPage setUser={setUser} />} />
          <Route path="/pro-signup" element={<ProSignupPage setUser={setUser} />} />
          <Route path="/certify-login" element={<CertifyLoginPage setUser={setUser} />} />
          <Route path="/certify-signup" element={<CertifySignupPage setUser={setUser} />} />
          
          <Route path="/skill-wallet/:walletUrl" element={<PublicSkillWalletPage />} />

          {/* Protected Routes - Certify Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute user={user}>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* Protected Routes - Kids Dashboard */}
          <Route
            path="/kids-dashboard"
            element={
              <PrivateRoute user={user}>
                <KidsDashboardPage user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />

          {/* Protected Routes - Pro Dashboard */}
          <Route
            path="/pro-dashboard"
            element={
              <PrivateRoute user={user}>
                <ProDashboardPage user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />

          {/* Protected Routes - Other */}
          <Route
            path="/certification/:certId"
            element={
              <PrivateRoute user={user}>
                <CertificationDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment/:certId"
            element={
              <PrivateRoute user={user}>
                <PaymentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/exam/:examId"
            element={
              <PrivateRoute user={user}>
                <ExamPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:examId"
            element={
              <PrivateRoute user={user}>
                <ResultsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/skill-wallet"
            element={
              <PrivateRoute user={user}>
                <SkillWalletPage user={user} />
              </PrivateRoute>
            }
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
