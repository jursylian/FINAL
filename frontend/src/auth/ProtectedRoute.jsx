import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="page">Загрузка...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}