import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Zap } from 'lucide-react';
import Logo from '../components/Logo';

function ProPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  const courses = [
    {
      title: 'AI for Quality Engineering',
      type: 'Monthly Course',
      duration: '4 weeks • 40 hours',
      description: 'Master AI techniques for quality assurance and advanced testing methodologies',
      color: 'from-blue-500 to-cyan-500',
      level: 'Intermediate',
    },
    {
      title: 'Google AI Fundamentals',
      type: 'Monthly Course',
      duration: '4 weeks • 40 hours',
      description: 'Learn Google\'s latest AI tools, APIs, and best practices for production',
      color: 'from-red-500 to-orange-500',
      level: 'Beginner',
    },
    {
      title: 'AI Foundations',
      type: 'Monthly Course',
      duration: '4 weeks • 45 hours',
      description: 'Comprehensive foundation in machine learning, deep learning, and AI basics',
      color: 'from-purple-500 to-indigo-500',
      level: 'Beginner',
    },
    {
      title: 'Microsoft GenAI Foundation Course',
      type: 'Weekend Crash Course',
      duration: '2 weekends • 16 hours',
      description: 'Intensive course on Microsoft\'s Generative AI tools and technologies',
      color: 'from-green-500 to-emerald-500',
      level: 'Intermediate',
    },
    {
      title: 'AI for Data Analysts',
      type: 'Weekend Crash Course',
      duration: '2 weekends • 16 hours',
      description: 'Apply AI techniques specifically for data analysis and insights generation',
      color: 'from-yellow-500 to-amber-500',
      level: 'Intermediate',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900 bg-opacity-50 backdrop-blur-md border-b border-blue-400 border-opacity-30 p-4 relative">
        <div className="absolute left-4 top-4">
          <Logo />
        </div>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white">Pro</h1>
          <p className="text-gray-300">Premium courses for Next level upskilling</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Our Premium Courses</h2>
          <p className="text-gray-300">Choose from our carefully curated professional development programs</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 border border-gray-600 hover:border-blue-400 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {/* Top Color Bar */}
              <div className={`h-1 bg-gradient-to-r ${course.color}`}></div>

              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="inline-block">
                    <span className={`inline-block bg-gradient-to-r ${course.color} text-white text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                      {course.type}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm">{course.description}</p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-600">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock size={18} className={`bg-gradient-to-r ${course.color} bg-clip-text text-transparent`} />
                    <span className="text-sm">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <BookOpen size={18} className={`bg-gradient-to-r ${course.color} bg-clip-text text-transparent`} />
                    <span className="text-sm">Level: <span className="font-semibold">{course.level}</span></span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate('/pro-signup');
                      }
                    }}
                    className={`py-2 rounded-lg font-semibold transition transform hover:scale-105 text-white bg-gradient-to-r ${course.color} hover:shadow-lg`}
                  >
                    Syllabus
                  </button>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate('/pro-signup');
                      }
                    }}
                    className={`py-2 rounded-lg font-semibold transition transform hover:scale-105 text-white bg-gradient-to-r ${course.color} hover:shadow-lg`}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-3">Ready to Level Up Your AI Skills?</h2>
          <p className="text-lg mb-6 text-blue-100">Join hundreds of professionals advancing their careers with Skilltej Pro</p>
          {!isLoggedIn && (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/pro-signup')}
                className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition transform hover:scale-105"
              >
                Sign Up Now
              </button>
              <button
                onClick={() => navigate('/pro-login')}
                className="px-8 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition transform hover:scale-105 border-2 border-white"
              >
                Already have an account?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProPage;
