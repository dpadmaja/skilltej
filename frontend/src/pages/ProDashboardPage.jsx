import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, BarChart3, Clock, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

function ProDashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'ai', label: 'AI & Machine Learning' },
    { id: 'cloud', label: 'Cloud Computing' },
    { id: 'data', label: 'Data Science' },
    { id: 'web', label: 'Web Development' },
    { id: 'devops', label: 'DevOps' },
  ];

  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const allCourses = [
    {
      id: 1,
      title: 'Advanced Python for AI',
      category: 'ai',
      level: 'advanced',
      duration: '12 weeks',
      description: 'Master advanced Python concepts and build intelligent applications with machine learning frameworks.',
      instructor: 'Dr. Sarah Chen',
      students: 5432,
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Cloud Architecture on AWS',
      category: 'cloud',
      level: 'intermediate',
      duration: '10 weeks',
      description: 'Design and deploy scalable cloud solutions on Amazon Web Services.',
      instructor: 'James Wilson',
      students: 3892,
      rating: 4.7,
    },
    {
      id: 3,
      title: 'Data Science Masterclass',
      category: 'data',
      level: 'advanced',
      duration: '14 weeks',
      description: 'Complete data science journey from analysis to deployment with real-world projects.',
      instructor: 'Prof. Michael Kumar',
      students: 7123,
      rating: 4.9,
    },
    {
      id: 4,
      title: 'React & Next.js Pro',
      category: 'web',
      level: 'intermediate',
      duration: '8 weeks',
      description: 'Build modern web applications with React and master the Next.js framework.',
      instructor: 'Emma Rodriguez',
      students: 6234,
      rating: 4.8,
    },
    {
      id: 5,
      title: 'Kubernetes & Container Orchestration',
      category: 'devops',
      level: 'advanced',
      duration: '9 weeks',
      description: 'Master container deployment and orchestration with Kubernetes.',
      instructor: 'Alex Thompson',
      students: 2134,
      rating: 4.6,
    },
    {
      id: 6,
      title: 'Beginner Python Essentials',
      category: 'ai',
      level: 'beginner',
      duration: '6 weeks',
      description: 'Start your programming journey with Python fundamentals and best practices.',
      instructor: 'Lisa Anderson',
      students: 9876,
      rating: 4.7,
    },
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const getFilteredCourses = () => {
    return allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  };

  const filteredCourses = getFilteredCourses();

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{course.title}</h3>
          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap ml-2">
            {levels.find(l => l.id === course.level)?.label}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 size={16} />
            {course.students.toLocaleString()} students
          </div>
          <div className="flex items-center gap-1">
            <Zap size={16} />
            ⭐ {course.rating}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">Instructor: <span className="font-semibold">{course.instructor}</span></p>
      </div>

      <div className="border-t pt-4 space-y-2">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          <Download size={16} />
          Course Curriculum
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          <Download size={16} />
          Course Notes
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
          <Download size={16} />
          Interview Prep
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition">
          <Download size={16} />
          Practice Questions
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} product="pro" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Courses</h1>
          <p className="text-gray-600">Advance your career with industry-leading courses</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Found <span className="font-semibold">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No courses found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProDashboardPage;
