import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { token, loading, error: authError } = useAuth();

  if (loading) {
    return (
      <div className="page">
        {authError && (
          <div className="mb-2 text-center text-xs text-red-500">
            {authError}
          </div>
        )}
        Загрузка...
      </div>
    );
  }

  if (!token) {
    if (authError) {
      return (
        <div className="page">
          <div className="mb-2 text-center text-xs text-red-500">
            {authError}
          </div>
          <div className="text-center text-sm">
            Сессия истекла. Перейдите на страницу входа.
          </div>
        </div>
      );
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}
