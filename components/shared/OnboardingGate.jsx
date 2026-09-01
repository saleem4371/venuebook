"use client";

import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingFlow from "./OnboardingFlow";
import { AnimatePresence } from "framer-motion";

export default function OnboardingGate() {
  const { showOnboarding, completeOnboarding, isInitialized, loadCookiePreferences, saveCookiePreferences } = useOnboarding();

  if (!isInitialized) return null;

  return (
    <AnimatePresence>
      {showOnboarding && <OnboardingFlow onComplete={completeOnboarding} loadCookiePreferences={loadCookiePreferences} saveCookiePreferences={saveCookiePreferences} />}
    </AnimatePresence>
  );
}
