import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Wallet } from 'lucide-react';
import Logo from './Logo';

function Navbar({ user, onLogout, product = 'certify' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    // Redirect to product-specific login based on current product
    if (product === 'kids') {
      navigate('/kids-login');
    } else if (product === 'pro') {
      navigate('/pro-login');
    } else {
      navigate('/certify-login');
    }
  };

  const getDashboardLink = () => {
    if (product === 'kids') return '/kids-dashboard';
    if (product === 'pro') return '/pro-dashboard';
    return '/dashboard';
  };

  const getProductName = () => {
    if (product === 'kids') return 'Skilltej Kids';
    if (product === 'pro') return 'Skilltej Pro';
    return 'Skilltej Certify';
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardLink()} className="flex items-center space-x-2">
            <Logo />
            <div className="text-white font-bold text-lg hidden sm:block">
              {getProductName()}
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {product !== 'kids' && (
              <>
                <Link to={getDashboardLink()} className="text-white hover:text-yellow-300 flex items-center space-x-1">
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
                {product === 'certify' && (
                  <Link to="/skill-wallet" className="text-white hover:text-yellow-300 flex items-center space-x-1">
                    <Wallet size={20} />
                    <span>Skill Wallet</span>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white text-sm hidden sm:inline">{user?.full_name}</span>
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
