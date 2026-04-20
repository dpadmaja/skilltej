import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { dashboardService, certificationService } from '../services/api';

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardService.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCertifications = () => {
    if (!dashboard?.available_certifications) return [];
    
    return dashboard.available_certifications.filter(cert => {
      const matchesCategory = categoryFilter === 'all' || cert.cert_type === categoryFilter;
      const matchesLevel = levelFilter === 'all' || cert.difficulty_level === levelFilter;
      return matchesCategory && matchesLevel;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredCerts = getFilteredCertifications();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your learning journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {dashboard.total_certifications}
            </div>
            <p className="text-gray-600">Available Certifications</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {dashboard.total_completed}
            </div>
            <p className="text-gray-600">Completed Certifications</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {dashboard.in_progress_exams.length}
            </div>
            <p className="text-gray-600">In Progress</p>
          </div>
        </div>
      )}

      {/* In Progress Exams */}
      {dashboard && dashboard.in_progress_exams.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="mr-2" size={28} />
            In Progress Exams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard.in_progress_exams.map((exam) => (
              <div key={exam.id} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {exam.certification_id}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Started: {new Date(exam.start_time).toLocaleString()}
                </p>
                <Link
                  to={`/exam/${exam.id}`}
                  className="btn-primary inline-block"
                >
                  Continue Exam
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Certifications with Filters */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BookOpen className="mr-2" size={28} />
          Available Certifications
        </h2>

        {/* Filter Section */}
        <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Filter size={24} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Certifications</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {['all', 'AI', 'Cloud', 'Data Science', 'Development', 'DevOps', 'Security'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat === 'all' ? 'all' : cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      categoryFilter === (cat === 'all' ? 'all' : cat)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Level</label>
              <div className="grid grid-cols-2 gap-2">
                {['all', 'Beginner', 'Intermediate', 'Expert'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level === 'all' ? 'all' : level)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      levelFilter === (level === 'all' ? 'all' : level)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {level === 'all' ? 'All' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Results Info */}
          <div className="mt-6 pt-6 border-t border-blue-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredCerts.length}</span> of{' '}
              <span className="font-bold">{dashboard?.available_certifications?.length || 0}</span> certifications
            </p>
          </div>
        </div>

        {/* Filtered Certifications Grid */}
        {filteredCerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert) => (
              <Link
                key={cert.id}
                to={`/certification/${cert.id}`}
                className="card hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="mb-4">
                  <div className="inline-block">
                    <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                      {cert.cert_type}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {cert.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {cert.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {cert.difficulty_level}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {cert.duration_minutes} mins
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    {cert.total_questions} questions
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    Pass: {cert.passing_score}%
                  </span>
                </div>
                <button className="btn-primary w-full">View Details</button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">No certifications found matching your filters</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filter selections</p>
          </div>
        )}
      </div>

      {/* Completed Certifications */}
      {dashboard && dashboard.completed_certifications.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="mr-2" size={28} />
            Completed Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard.completed_certifications.map((item, idx) => (
              <div key={idx} className="card border-l-4 border-green-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.certification.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-bold text-green-600">{item.score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Practical Ability:</span>
                    <span className="font-semibold">{item.practical_ability?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debugging Ability:</span>
                    <span className="font-semibold">{item.debugging_ability?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{new Date(item.pass_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
