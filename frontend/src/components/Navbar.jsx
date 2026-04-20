import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Wallet } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/certify-login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-white font-bold text-xl">
              <span>Certify</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-white hover:text-yellow-300 flex items-center space-x-1">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/skill-wallet" className="text-white hover:text-yellow-300 flex items-center space-x-1">
              <Wallet size={20} />
              <span>Skill Wallet</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
