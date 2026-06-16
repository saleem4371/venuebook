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

  // ✅ Load user from backend — returns the fresh user object so callers
  // can use it immediately without waiting for a React re-render cycle.
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;          // ← callers receive fresh data synchronously
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ login after success
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    // 1. Clear React state — the LogoutOverlay covers the UI at this point
    setUser(null);

    // 2. Best-effort server-side session invalidation
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // swallow — local state is already cleared; proceed with cleanup
    }

    // 3. Wipe the auth cookie (root path + any sub-paths)
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";

    // 4. Clear any auth-scoped session storage
    try { sessionStorage.removeItem("auth_user"); } catch (_) {}
    try { sessionStorage.removeItem("user"); } catch (_) {}

    // Navigation is handled by the caller after the overlay has been shown
    // for the required minimum duration (800ms). Do NOT navigate here.
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
