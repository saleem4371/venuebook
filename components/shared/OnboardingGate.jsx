"use client";

import { useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingFlow from "./OnboardingFlow";
import { AnimatePresence } from "framer-motion";
import { useModal } from "@/context/ModalContext";

export default function OnboardingGate() {
  const { showOnboarding, completeOnboarding, isInitialized, loadCookiePreferences, saveCookiePreferences, getSavedCookieAction } = useOnboarding();
  const { requestModal, releaseModal, canShow } = useModal();

  useEffect(() => {
    if (isInitialized && showOnboarding) {
      requestModal("onboarding");
    } else {
      releaseModal("onboarding");
    }
    return () => {
      releaseModal("onboarding");
    };
  }, [isInitialized, showOnboarding, requestModal, releaseModal]);

  if (!isInitialized) return null;

  const isEligible = canShow("onboarding") || canShow("cookie_preferences");

  return (
    <AnimatePresence>
      {showOnboarding && isEligible && (
        <OnboardingFlow 
          onComplete={() => {
            releaseModal("onboarding");
            releaseModal("cookie_preferences");
            completeOnboarding();
          }} 
          loadCookiePreferences={loadCookiePreferences} 
          saveCookiePreferences={saveCookiePreferences}
          getSavedCookieAction={getSavedCookieAction}
        />
      )}
    </AnimatePresence>
  );
}

