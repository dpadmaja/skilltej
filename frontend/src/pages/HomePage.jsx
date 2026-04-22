import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Award } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div>
          <img src="/logo.jpg" alt="Skilltej" className="h-16 object-contain rounded-lg shadow-lg" />
        </div>
        <div className="text-right">
          <p className="text-xl text-gray-300">The Future of Learning</p>
        </div>
      </div>

      {/* Main Content - 3 Product Buttons */}
      <div className="flex items-center justify-center min-h-[calc(100vh-300px)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Kids */}
          <button
            onClick={() => navigate('/kids')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-white text-center transition transform hover:scale-105 shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4">
                <Users size={48} className="mx-auto mb-4" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Kids</h3>
              <p className="text-lg text-gray-100">Learn AI basics playfully</p>
            </div>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
          </button>

          {/* Pro */}
          <button
            onClick={() => navigate('/pro')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-8 text-white text-center transition transform hover:scale-105 shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4">
                <Zap size={48} className="mx-auto mb-4" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Pro</h3>
              <p className="text-lg text-gray-100">Advanced AI mastery programs</p>
            </div>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
          </button>

          {/* Certify */}
          <button
            onClick={() => navigate('/certify')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-white text-center transition transform hover:scale-105 shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-4">
                <Award size={48} className="mx-auto mb-4" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Certify</h3>
              <p className="text-lg text-gray-100">Earn professional certifications</p>
            </div>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
          </button>
        </div>
      </div>


    </div>
  );
}

export default HomePage;
