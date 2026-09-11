"use client";

import { useEffect, useState } from "react";

const ONBOARDING_KEY = "vb_onboarding_completed";

const COOKIE_PREFS_KEY = "vb_cookie_prefs";

export function isCookieConsentPending() {
  if (typeof window === "undefined") return false;
  if (window.__vbCookieConsentPending === false) return false;
  if (window.__vbCookieConsentPending === true) return true;
  try {
    const hasPrefs = localStorage.getItem(COOKIE_PREFS_KEY) !== null;
    return !hasPrefs;
  } catch {
    return false;
  }
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(ONBOARDING_KEY) === "1";
      const hasPrefs = localStorage.getItem(COOKIE_PREFS_KEY) !== null;
      if (!isCompleted) {
        setShowOnboarding(true);
      }
      if (!hasPrefs) {
        if (typeof window !== "undefined") {
          window.__vbCookieConsentPending = true;
          window.dispatchEvent(new CustomEvent("vb-cookie-consent-pending"));
        }
      } else {
        if (typeof window !== "undefined") {
          window.__vbCookieConsentPending = false;
        }
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
      if (typeof window !== "undefined") {
        window.__vbCookieConsentPending = false;
        window.dispatchEvent(new CustomEvent("vb-cookie-consent-completed"));
      }
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

  const getSavedCookieAction = () => {
    try {
      const action = localStorage.getItem("vb_cookie_action");
      if (action) return action;
      const saved = localStorage.getItem(COOKIE_PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.analytics && parsed.marketing) return "accept";
        if (!parsed.analytics && !parsed.marketing) return "reject";
        return "manage";
      }
    } catch {
      // Ignore
    }
    return null;
  };

  const saveCookiePreferences = (prefs, action = null) => {
    try {
      localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify({ ...prefs, required: true }));
      if (action) {
        localStorage.setItem("vb_cookie_action", action);
      }
      if (typeof window !== "undefined") {
        window.__vbCookieConsentPending = false;
        window.dispatchEvent(new CustomEvent("vb-cookie-consent-completed"));
      }
    } catch {
      // Ignore
    }
  };

  return { showOnboarding, completeOnboarding, isInitialized, loadCookiePreferences, saveCookiePreferences, getSavedCookieAction };
}
