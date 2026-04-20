import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, BookOpen, MapPin } from 'lucide-react';
import Logo from '../components/Logo';
import { authService } from '../services/api';

function KidsSignupPage({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    grade: '',
    city: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const grades = ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const cities = ['Select a city', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Other'];

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

    if (!formData.email || !formData.username || !formData.password || !formData.full_name || !formData.grade || !formData.city) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signup(formData);
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.user) {
          setUser(response.data.user);
        }
        navigate('/kids-dashboard');
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message || 'Signup failed. Please try again.';
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
              <filter id="watercolor-kids-signup">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
              </filter>
            </defs>
            
            {/* Background */}
            <rect width="400" height="500" fill="#fdf2f8" />
            
            {/* Watercolor blobs - Kids themed */}
            <circle cx="80" cy="100" r="50" fill="#ec4899" opacity="0.3" filter="url(#watercolor-kids-signup)" />
            <circle cx="320" cy="80" r="70" fill="#a855f7" opacity="0.25" filter="url(#watercolor-kids-signup)" />
            <circle cx="120" cy="300" r="60" fill="#f43f5e" opacity="0.28" filter="url(#watercolor-kids-signup)" />
            <circle cx="300" cy="350" r="75" fill="#d946ef" opacity="0.3" filter="url(#watercolor-kids-signup)" />
            <circle cx="200" cy="450" r="55" fill="#ff1493" opacity="0.25" filter="url(#watercolor-kids-signup)" />
            
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

        {/* Right Side - Signup Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Join Skilltej Kids!</h1>
              <p className="text-gray-600">Start your learning adventure today</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Your name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="coolname123"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3 text-gray-400" size={18} />
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="">Select your grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 text-gray-400" size={18} />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="">Select your city</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/kids-login')}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KidsSignupPage;
