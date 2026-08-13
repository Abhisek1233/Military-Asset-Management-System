import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying Military Security Credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center text-rose-500">
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1">Your assigned role ({user.role}) does not have clearance for this module.</p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
