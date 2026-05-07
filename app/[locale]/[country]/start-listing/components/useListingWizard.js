"use client";

import { useState, useCallback, useEffect } from "react";
import { WIZARD_STEPS, validateStep } from "./wizardConfig";

// ─────────────────────────────────────────────────────────────────────────────
//  useListingWizard — single source of truth for wizard state
//  Restores saved draft from localStorage on mount (keyed by category).
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_KEY = (cat) => `listing_draft_${cat}`;

export function useListingWizard(initialCategory = "") {
  const [stepIndex, setStepIndex] = useState(0);
  const [form,      setForm]      = useState({ category: initialCategory, images: [] });
  const [attempted, setAttempted] = useState({});
  const [hydrated,  setHydrated]  = useState(false);

  // Restore draft from localStorage after first client render
  useEffect(() => {
    if (!initialCategory) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY(initialCategory));
      if (raw) {
        const saved = JSON.parse(raw);
        // Restore form (strip non-serialisable blobs — re-uploaded separately)
        const restoredForm = {
          ...saved.form,
          category: initialCategory,
          images: [],           // blob URLs don't survive serialisation
        };
        setForm(restoredForm);
        if (typeof saved.stepIndex === "number") setStepIndex(saved.stepIndex);
      }
    } catch (_) {
      // Corrupt draft — ignore silently
    }
    setHydrated(true);
  }, [initialCategory]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const totalSteps      = WIZARD_STEPS.length;
  const currentStep     = WIZARD_STEPS[stepIndex];
  const isFirst         = stepIndex === 0;
  const isLast          = stepIndex === totalSteps - 1;
  const progress        = Math.round((stepIndex / (totalSteps - 1)) * 100);
  const isCurrentValid  = validateStep(currentStep.key, form);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const updateForm = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const attemptStep = useCallback((key) => {
    setAttempted((prev) => ({ ...prev, [key]: true }));
  }, []);

  const goNext = useCallback(() => {
    setAttempted((prev) => ({ ...prev, [currentStep.key]: true }));
    if (!isCurrentValid) return;
    if (!isLast) setStepIndex((i) => i + 1);
  }, [currentStep.key, isCurrentValid, isLast]);

  const goBack = useCallback(() => {
    if (!isFirst) setStepIndex((i) => i - 1);
  }, [isFirst]);

  const goToStep = useCallback(
    (index) => {
      if (index >= 0 && index < totalSteps) setStepIndex(index);
    },
    [totalSteps],
  );

  // Persist current progress to localStorage (called by Save & Exit)
  const saveDraft = useCallback(() => {
    if (!initialCategory) return;
    try {
      const serialisable = { ...form, images: [] }; // strip blob URLs
      localStorage.setItem(
        DRAFT_KEY(initialCategory),
        JSON.stringify({ form: serialisable, stepIndex }),
      );
    } catch (_) {}
  }, [form, stepIndex, initialCategory]);

  // Clear draft (called after successful submit)
  const clearDraft = useCallback(() => {
    if (!initialCategory) return;
    try { localStorage.removeItem(DRAFT_KEY(initialCategory)); } catch (_) {}
  }, [initialCategory]);

  return {
    stepIndex,
    totalSteps,
    currentStep,
    progress,
    form,
    setForm,
    updateForm,
    attempted,
    attemptStep,
    isCurrentValid,
    isFirst,
    isLast,
    hydrated,
    goNext,
    goBack,
    goToStep,
    saveDraft,
    clearDraft,
  };
}
