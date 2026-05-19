"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;
const isListed =
  Number(user?.is_vendor) === 1;

  // ✅ Load user from backend (IMPORTANT)
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ login after success
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback( async() => {
    setUser(null);
    await api.post("/auth/logout");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }, []);

  // ✅ auto check on refresh
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        isListed,
        login,
        logout,
        fetchUser, // 👈 IMPORTANT
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
