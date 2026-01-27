import React, { createContext, useContext, useEffect, useState } from "react";

import { request } from "../lib/apiClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await request("/auth/me");
        if (mounted) {
          setUser(data.user);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setError(err.message);
          localStorage.removeItem("token");
          setToken(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadMe();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login({ email, username, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register({ email, username, password, name }) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password, name }),
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    loading,
    error,
    login,
    register,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
