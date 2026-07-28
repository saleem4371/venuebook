"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

// The backend's /auth/me and /auth/social-login responses don't carry a
// profile-photo field yet — a Google login's real avatar (captured from
// Google's own userinfo response at login time, see LoginModal.jsx) and
// anything set via Account Settings' "Change photo" both only exist on
// this side, so they're persisted here, keyed per-account, and reapplied
// on top of whatever the backend returns whenever it comes back empty.
// This is the ONE place `user.avatar` gets filled in from a non-backend
// source — every component that renders an avatar just reads `user.avatar`
// as before, so nothing downstream needed to change.
const AVATAR_KEY_PREFIX = "vb_avatar_override:";

function avatarKeyFor(u) {
  const id = u?.email || u?.id || u?.phone || "anon";
  return `${AVATAR_KEY_PREFIX}${id}`;
}

function withStoredAvatar(u) {
  if (!u || u.avatar) return u;
  try {
    const saved = localStorage.getItem(avatarKeyFor(u));
    if (saved) return { ...u, avatar: saved };
  } catch (_) {}
  return u;
}

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
      const nextUser = withStoredAvatar(res.data);
      setUser(nextUser);
      return nextUser;          // ← callers receive fresh data synchronously
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ login after success
  const login = useCallback((userData) => {
    setUser(withStoredAvatar(userData));
  }, []);

  // ✅ Set (or replace) the current user's avatar — used by both the
  // Google-login capture (LoginModal.jsx, when the backend doesn't return
  // a photo of its own) and Account Settings' real "Change photo" upload.
  // Persisted per-account so it survives refresh/relogin without a
  // backend field to store it in.
  const updateAvatar = useCallback((avatarUrl) => {
    setUser((prev) => {
      if (!prev) return prev;
      try {
        localStorage.setItem(avatarKeyFor(prev), avatarUrl);
      } catch (_) {}
      return { ...prev, avatar: avatarUrl };
    });
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
        updateAvatar,
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
