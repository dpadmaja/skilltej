import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ user, children }) {
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const isAuthenticated = !!user || !!storedUser;
  if (!isAuthenticated) {
    return <Navigate to="/certify-login" />;
  }
  // Do not pass a merged user prop to children; individual pages can read from localStorage if needed
  return children;
}

export default PrivateRoute;
