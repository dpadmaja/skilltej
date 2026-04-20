import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Award, TrendingUp, Shield, Filter } from 'lucide-react';
import Logo from '../components/Logo';
import { certificationService } from '../services/api';

function CertifyPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    if (isLoggedIn) {
      loadCertifications();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const loadCertifications = async () => {
    try {
      const response = await certificationService.getAllCertifications();
      setCertifications(response.data || []);
    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCertifications = () => {
    return certifications.filter(cert => {
      const matchesCategory = categoryFilter === 'all' || 
        cert.name.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        (categoryFilter === 'ai' && cert.name.toLowerCase().includes('ai')) ||
        (categoryFilter === 'cloud' && cert.name.toLowerCase().includes('cloud'));
      
      const matchesLevel = levelFilter === 'all' || 
        (cert.difficulty_level && cert.difficulty_level.toLowerCase() === levelFilter.toLowerCase());
      
      return matchesCategory && matchesLevel;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header with Navigation */}
      <div className="bg-slate-900 bg-opacity-50 backdrop-blur-md border-b border-blue-400 border-opacity-30 p-4 relative">
        <div className="absolute left-4 top-4">
          <Logo />
        </div>
        <div className="max-w-7xl mx-auto text-center flex-1">
          <h1 className="text-3xl font-bold text-white">Certify</h1>
          <p className="text-gray-300">Professional AI Certifications</p>
        </div>
        {!isLoggedIn && (
          <div className="absolute right-4 top-4 flex gap-3">
            <button
              onClick={() => navigate('/certify-login')}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              <LogIn size={20} />
              <span>Log In</span>
            </button>
            <button
              onClick={() => navigate('/certify-signup')}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition"
            >
              <UserPlus size={20} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Earn Industry-Recognized <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Certifications</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Validate your AI expertise with professional certifications trusted by leading enterprises worldwide. Master cutting-edge technologies and advance your career with recognized credentials.
          </p>

          {!isLoggedIn && (
            <button
              onClick={() => navigate('/certify-signup')}
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition transform hover:scale-105 shadow-lg"
            >
              Get Started Now
            </button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-blue-400 border-opacity-30 hover:border-opacity-100 transition">
            <Award size={40} className="text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Expert-Designed</h3>
            <p className="text-gray-300">Comprehensive curriculum built by AI industry experts and practitioners</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-green-400 border-opacity-30 hover:border-opacity-100 transition">
            <TrendingUp size={40} className="text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Career Growth</h3>
            <p className="text-gray-300">Boost your career prospects and salary with recognized certifications</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-purple-400 border-opacity-30 hover:border-opacity-100 transition">
            <Shield size={40} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Verified Skills</h3>
            <p className="text-gray-300">Rigorous exams assess and verify your knowledge and practical abilities</p>
          </div>
        </div>

        {/* Certifications List */}
        {isLoggedIn && certifications.length > 0 ? (
          <div>
            <h3 className="text-3xl font-bold text-white mb-8">Available Certifications</h3>
            
            {/* Filter Section */}
            <div className="mb-8 bg-slate-800 bg-opacity-50 rounded-xl p-6 border border-gray-600">
              <div className="flex items-center space-x-2 mb-4">
                <Filter size={20} className="text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Filter Certifications</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="ai">AI</option>
                    <option value="cloud">Cloud</option>
                  </select>
                </div>
                
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filtered Certifications Grid */}
            {getFilteredCertifications().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredCertifications().map((cert) => (
                  <button
                    key={cert.id}
                    onClick={() => navigate(`/certification/${cert.id}`)}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-gray-600 hover:border-blue-400 p-6 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                  >
                    <div className="text-left">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                        <Award size={24} className="text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{cert.name}</h4>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{cert.description}</p>
                      <div className="flex justify-between text-xs text-gray-400 mb-4">
                        <span>⏱️ {cert.duration_minutes} mins</span>
                        <span>❓ {cert.total_questions} questions</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 font-semibold">Passing Score: {cert.passing_score}%</span>
                        <span className="text-white font-bold group-hover:translate-x-2 transition">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-800 bg-opacity-50 rounded-xl border border-gray-600">
                <p className="text-gray-300 text-lg">No certifications found matching your filters. Try adjusting your selection.</p>
              </div>
            )}
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-16 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl border-2 border-dashed border-blue-400 border-opacity-50">
            <Award size={48} className="mx-auto text-blue-400 mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">Sign Up to Explore Certifications</h3>
            <p className="text-gray-300 mb-6">Create an account to view our complete catalog of professional certifications</p>
            <button
              onClick={() => navigate('/certify-signup')}
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition"
            >
              Create Account
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="text-gray-300 mt-4">Loading certifications...</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-300">
            <p>No certifications available. Please check back soon!</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {isLoggedIn && (
        <div className="border-t border-gray-700 mt-16 pt-12 pb-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-300 text-lg">
              Ready to start your certification journey? Choose a certification above to begin!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertifyPage;
