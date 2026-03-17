import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../pages/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;