import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logo() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center space-x-2 hover:opacity-80 transition"
    >
      <img src="/logo.jpg" alt="Skilltej" className="h-12 object-contain" />
    </button>
  );
}

export default Logo;
