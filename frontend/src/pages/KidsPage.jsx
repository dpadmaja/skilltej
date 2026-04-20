import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Briefcase, DollarSign, Heart, Users, Brain, Zap, Dumbbell } from 'lucide-react';
import Logo from '../components/Logo';

function KidsPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  const skills = [
    { name: 'Entrepreneurship', icon: Briefcase, color: 'from-red-500 to-orange-500' },
    { name: 'Financial Literacy', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { name: 'Emotional Intelligence', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { name: 'Communication Skills', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { name: 'Problem Solving', icon: Brain, color: 'from-purple-500 to-indigo-500' },
    { name: 'Social Skills', icon: Users, color: 'from-yellow-500 to-amber-500' },
    { name: 'Digital & AI', icon: Zap, color: 'from-violet-500 to-purple-500' },
    { name: 'Health & Fitness', icon: Dumbbell, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900 bg-opacity-50 backdrop-blur-md border-b border-blue-400 border-opacity-30 p-4 relative">
        <div className="absolute left-4 top-4">
          <Logo />
        </div>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white">Kids</h1>
          <p className="text-gray-300">Learn Life Skills & AI Playfully</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Side - Skills */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white mb-8">Life Skills Curriculum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate('/kids-signup');
                      }
                    }}
                    className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${skill.color} p-6 text-white transition transform hover:scale-105 shadow-lg cursor-pointer`}
                  >
                    <div className="relative z-10 flex items-center space-x-4">
                      <Icon size={40} className="flex-shrink-0" />
                      <div className="text-left">
                        <h3 className="text-lg font-bold">{skill.name}</h3>
                        {!isLoggedIn && <p className="text-sm text-gray-100">Sign up to explore</p>}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side - Authentication */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {isLoggedIn ? (
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 text-white shadow-2xl text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={32} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Welcome!</h3>
                  <p className="text-green-100 mb-6">You're all set to explore our life skills courses.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white text-green-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sign Up Card */}
                  <button
                    onClick={() => navigate('/kids-signup')}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 p-6 text-white transition transform hover:scale-105 shadow-lg"
                  >
                    <div className="relative z-10 text-center">
                      <UserPlus size={40} className="mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-2">Sign Up</h3>
                      <p className="text-sm text-gray-100">Create your free account</p>
                    </div>
                  </button>

                  {/* Login Card */}
                  <button
                    onClick={() => navigate('/kids-login')}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white transition transform hover:scale-105 shadow-lg"
                  >
                    <div className="relative z-10 text-center">
                      <LogIn size={40} className="mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-2">Log In</h3>
                      <p className="text-sm text-gray-100">Access your account</p>
                    </div>
                  </button>

                  {/* Info Card */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-blue-400 border-opacity-30 text-white">
                    <p className="text-sm">
                      <span className="text-cyan-400 font-semibold">🎓 Age-appropriate learning:</span> Designed for kids ages 8-14
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KidsPage;
