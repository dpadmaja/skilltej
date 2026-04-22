import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BarChart3, TrendingUp, Book, BookOpen, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';

function KidsDashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const storedUser = JSON.parse((typeof window !== 'undefined') ? localStorage.getItem('user') || 'null' : 'null');
  const _user = storedUser || user;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [localUser, setLocalUser] = useState(_user);
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setLocalUser(null);
    navigate('/kids-login');
  };
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'learning-path', label: 'Learning Path', icon: BookOpen },
    { id: 'life-skills', label: 'Life Skills', icon: Book },
    { id: 'resources', label: 'Resources', icon: RotateCcw },
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const userGrade = user?.grade || user?.student_grade || '5';

  const lifeSkills = [
    { id: 1, name: 'Entrepreneurship', progress: 45, grade: userGrade },
    { id: 2, name: 'Financial Literacy', progress: 60, grade: userGrade },
    { id: 3, name: 'Emotional Intelligence', progress: 30, grade: userGrade },
    { id: 4, name: 'Communication Skills', progress: 75, grade: userGrade },
    { id: 5, name: 'Problem Solving', progress: 0, grade: userGrade },
    { id: 6, name: 'Social Skills', progress: 0, grade: userGrade },
    { id: 7, name: 'Digital & AI', progress: 0, grade: userGrade },
    { id: 8, name: 'Health & Fitness', progress: 0, grade: userGrade },
  ];

  const learningPaths = [
    { id: 1, subject: 'Mathematics', grade: userGrade, progress: 55, improvement: 'Fractions & Decimals' },
    { id: 2, subject: 'Science', grade: userGrade, progress: 45, improvement: 'Photosynthesis' },
    { id: 3, subject: 'English', grade: userGrade, progress: 60, improvement: 'Essay Writing' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map(path => (
            <div key={path.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{path.subject}</h4>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">Grade {path.grade}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{width: `${path.progress}%`}}></div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{path.progress}% Complete</p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg hover:shadow-lg transition">
                Continue Learning
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Life Skills Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lifeSkills.map(skill => (
            <div key={skill.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{width: `${skill.progress}%`}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{skill.progress}% Complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLearningPath = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Learning Paths by Grade</h3>
      {learningPaths.map(path => (
        <div key={path.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{path.subject}</h4>
              <p className="text-sm text-gray-600">Grade {path.grade}</p>
            </div>
            <span className="text-3xl font-bold text-blue-600">{path.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full" style={{width: `${path.progress}%`}}></div>
          </div>
          <p className="text-sm text-orange-600 mb-4">📌 Improvement Area: {path.improvement}</p>
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg hover:shadow-lg transition">
              Continue Learning
            </button>
            <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:shadow-lg transition">
              Subscribe
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLifeSkills = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Life Skills</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Available</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Subscribed</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lifeSkills.map(skill => (
          <div key={skill.id} className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-2">{skill.name}</h4>
            <p className="text-sm text-gray-600 mb-4">Build essential {skill.name.toLowerCase()} for your personal and professional growth.</p>
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">User Guide Topics:</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Introduction & Basics</li>
                <li>Practical Applications</li>
                <li>Real-world Examples</li>
              </ul>
            </div>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">📇 Flash Cards</h4>
          <p className="text-gray-600 mb-4">Fast-track your learning with interactive flashcards for Mathematics, Science & English.</p>
          <div className="space-y-2">
            <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition">
              Mathematics Grade 5
            </button>
            <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition">
              Science Grade 5
            </button>
            <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition">
              English Grade 5
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">🗺️ Mind Maps</h4>
          <p className="text-gray-600 mb-4">Visual learning with comprehensive mind maps for complex topics.</p>
          <div className="space-y-2">
            <button className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition">
              Photosynthesis Map
            </button>
            <button className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition">
              Life Cycles Map
            </button>
            <button className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition">
              Grammar Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={localUser} onLogout={handleLogout} product="kids" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'learning-path' && renderLearningPath()}
          {activeTab === 'life-skills' && renderLifeSkills()}
          {activeTab === 'resources' && renderResources()}
        </div>
      </div>
    </div>
  );
}

export default KidsDashboardPage;
