"use client";

import { useEffect, useState } from "react";

const ONBOARDING_KEY = "vb_onboarding_completed";

const COOKIE_PREFS_KEY = "vb_cookie_prefs";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(ONBOARDING_KEY) === "1";
      if (!isCompleted) {
        setShowOnboarding(true);
      }
    } catch {
      // In case of privacy mode or SSR, default to not showing
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // Ignore
    }
    setShowOnboarding(false);
  };

  const loadCookiePreferences = () => {
    try {
      const saved = localStorage.getItem(COOKIE_PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return { required: true, analytics: false, marketing: false };
  };

  const saveCookiePreferences = (prefs) => {
    try {
      localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify({ ...prefs, required: true }));
    } catch {
      // Ignore
    }
  };

  return { showOnboarding, completeOnboarding, isInitialized, loadCookiePreferences, saveCookiePreferences };
}
