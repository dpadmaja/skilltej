import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { authService } from '../services/api';

function KidsLoginPage({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(formData);
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.user) {
          setUser(response.data.user);
        }
        navigate('/kids-dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Login failed. Please try again.';
      setError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden mt-4">
        {/* Left Side - Watercolor Image */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 items-center justify-center p-8">
          <svg className="w-full h-full max-w-lg max-h-lg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="watercolor-kids">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
              </filter>
            </defs>
            
            {/* Background */}
            <rect width="400" height="500" fill="#fdf2f8" />
            
            {/* Watercolor blobs - Kids themed */}
            <circle cx="80" cy="100" r="50" fill="#ec4899" opacity="0.3" filter="url(#watercolor-kids)" />
            <circle cx="320" cy="80" r="70" fill="#a855f7" opacity="0.25" filter="url(#watercolor-kids)" />
            <circle cx="120" cy="300" r="60" fill="#f43f5e" opacity="0.28" filter="url(#watercolor-kids)" />
            <circle cx="300" cy="350" r="75" fill="#d946ef" opacity="0.3" filter="url(#watercolor-kids)" />
            <circle cx="200" cy="450" r="55" fill="#ff1493" opacity="0.25" filter="url(#watercolor-kids)" />
            
            {/* Stars */}
            <circle cx="100" cy="150" r="8" fill="#fbbf24" opacity="0.6" />
            <circle cx="300" cy="200" r="6" fill="#fbbf24" opacity="0.5" />
            <circle cx="150" cy="400" r="7" fill="#fbbf24" opacity="0.6" />
            
            {/* Decorative curves */}
            <path d="M 50 200 Q 100 150 150 200 T 250 200" stroke="#ec4899" strokeWidth="2.5" fill="none" opacity="0.4" />
            <path d="M 150 350 Q 200 300 250 350 T 380 380" stroke="#a855f7" strokeWidth="2.5" fill="none" opacity="0.4" />
            
            {/* Text */}
            <text x="200" y="440" fontSize="20" fontWeight="bold" fill="#c2185b" textAnchor="middle" fontFamily="Arial, sans-serif">
              Let's Learn!
            </text>
            <text x="200" y="465" fontSize="13" fill="#ec4899" textAnchor="middle" fontFamily="Arial, sans-serif">
              Fun Learning Adventure Awaits
            </text>
          </svg>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
              <p className="text-gray-600 text-lg">Sign in to continue your learning adventure</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/kids-signup')}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KidsLoginPage;
