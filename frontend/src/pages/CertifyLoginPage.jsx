import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { authService } from '../services/api';

function CertifyLoginPage({ setUser }) {
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
        navigate('/certify');
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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Watercolor Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 items-center justify-center relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-6 left-6 z-10">
          <Logo />
        </div>

        {/* SVG Watercolor Background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="watercolor-certify-login">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
            </filter>
          </defs>
          
          {/* Background */}
          <rect width="400" height="600" fill="#f0f9ff" />
          
          {/* Watercolor blobs */}
          <circle cx="80" cy="120" r="70" fill="#0369a1" opacity="0.25" filter="url(#watercolor-certify-login)" />
          <circle cx="350" cy="100" r="90" fill="#0284c7" opacity="0.2" filter="url(#watercolor-certify-login)" />
          <circle cx="120" cy="350" r="80" fill="#00d9ff" opacity="0.22" filter="url(#watercolor-certify-login)" />
          <circle cx="320" cy="420" r="100" fill="#06b6d4" opacity="0.25" filter="url(#watercolor-certify-login)" />
          <circle cx="200" cy="500" r="70" fill="#0891b2" opacity="0.2" filter="url(#watercolor-certify-login)" />
          
          {/* Decorative curves */}
          <path d="M 50 200 Q 120 150 180 190 T 350 180" stroke="#0369a1" strokeWidth="2.5" fill="none" opacity="0.4" />
          <path d="M 100 400 Q 180 350 250 400 T 380 450" stroke="#06b6d4" strokeWidth="2.5" fill="none" opacity="0.4" />
        </svg>
        
        <div className="relative z-20 text-center px-12">
          <div className="text-6xl mb-6">🎓</div>
          <h2 className="text-4xl font-bold text-sky-900 mb-4">Professional Certifications</h2>
          <p className="text-xl text-sky-700 mb-8">Achieve recognition and advance your career with industry-standard certifications</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 text-sky-900">
              <div className="w-10 h-10 bg-sky-200 rounded-full flex items-center justify-center">✓</div>
              <span>Expert-designed curriculum</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sky-900">
              <div className="w-10 h-10 bg-sky-200 rounded-full flex items-center justify-center">✓</div>
              <span>Industry-recognized credentials</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sky-900">
              <div className="w-10 h-10 bg-sky-200 rounded-full flex items-center justify-center">✓</div>
              <span>Rigorous assessment process</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col p-6 lg:p-0">
        {/* Logo - Mobile */}
        <div className="lg:hidden p-6 flex items-center space-x-2">
          <Logo />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
              <p className="text-gray-600 text-lg">Sign in to access your certifications</p>
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/certify-signup')}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition"
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

export default CertifyLoginPage;
