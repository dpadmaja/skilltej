import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { authService } from '../services/api';

function SignupPage({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
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

    // Validate form
    if (!formData.email || !formData.username || !formData.password || !formData.full_name) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const signupData = {
        ...formData,
        product: 'certify'  // Set product to certify
      };
      const response = await authService.signup(signupData);
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.user) {
          setUser(response.data.user);
        }
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || 
                         err.message || 
                         'Signup failed. Please try again.';
      setError(errorDetail);
      console.error('Signup error:', err);
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
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-8">
          <svg className="w-full h-full max-w-lg max-h-lg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="watercolor-signup">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
              </filter>
            </defs>
            
            {/* Background */}
            <rect width="400" height="500" fill="#f0f9ff" />
            
            {/* Watercolor blobs */}
            <circle cx="100" cy="100" r="55" fill="#3b82f6" opacity="0.3" filter="url(#watercolor-signup)" />
            <circle cx="300" cy="120" r="75" fill="#6366f1" opacity="0.25" filter="url(#watercolor-signup)" />
            <circle cx="80" cy="300" r="65" fill="#4f46e5" opacity="0.28" filter="url(#watercolor-signup)" />
            <circle cx="320" cy="350" r="80" fill="#7c3aed" opacity="0.3" filter="url(#watercolor-signup)" />
            <circle cx="200" cy="430" r="60" fill="#8b5cf6" opacity="0.25" filter="url(#watercolor-signup)" />
            
            {/* Decorative curves */}
            <path d="M 50 150 Q 100 100 150 140 T 250 130" stroke="#3b82f6" strokeWidth="3" fill="none" opacity="0.5" />
            <path d="M 100 320 Q 150 270 200 300 T 350 380" stroke="#7c3aed" strokeWidth="3" fill="none" opacity="0.5" />
            
            {/* Gradient circles hint */}
            <circle cx="200" cy="250" r="40" fill="none" stroke="#4f46e5" strokeWidth="1.5" opacity="0.3" />
            
            {/* Text */}
            <text x="200" y="440" fontSize="22" fontWeight="bold" fill="#1e3a8a" textAnchor="middle" fontFamily="Arial, sans-serif">
              Your Learning Path
            </text>
            <text x="200" y="465" fontSize="13" fill="#3b82f6" textAnchor="middle" fontFamily="Arial, sans-serif">
              Starts Here
            </text>
          </svg>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600 text-lg">Join Skilltej Certify and start learning</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="johndoe"
                    required
                  />
                </div>
              </div>

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
                    required
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
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
