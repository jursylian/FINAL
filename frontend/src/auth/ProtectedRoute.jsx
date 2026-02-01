import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { token, loading, error: authError } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[14px] text-[#737373]">
        {authError && (
          <div className="mb-2 text-center text-xs text-red-500">
            {authError}
          </div>
        )}
        Loading...
      </div>
    );
  }

  if (!token) {
    if (authError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <div className="mb-2 text-xs text-red-500">{authError}</div>
            <div className="text-sm text-[#262626]">
              Session expired. Please log in again.
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}
