"use client";

import { useState, useCallback, useEffect } from "react";
import { validateStep } from "./wizardConfig";
import { getBlob, deleteByPrefix } from "./imageStore";

// ─────────────────────────────────────────────────────────────────────────────
//  useListingWizard — form state, validation, and draft persistence.
//
//  Step navigation is NOT managed here — WizardShell owns the URL routing.
//
//  Image persistence strategy:
//    • MediaStep saves each uploaded File blob to IndexedDB at upload time,
//      keyed as `{category}/{imageId}`.
//    • saveDraft stores image metadata (id, name, size, dupKey, cover) in
//      localStorage — blob URLs are stripped since they're session-only.
//    • On restore, image metadata is read from localStorage and blobs are
//      fetched from IndexedDB to create fresh blob URLs.
//    • clearDraft purges both localStorage and IndexedDB for the category.
//
//  Review-navigation mode (reviewReached):
//    • Once the user lands on the Review step for the first time,
//      markReviewReached() is called by WizardShell.
//    • This sets reviewReached = true in state AND immediately merges it into
//      the localStorage draft so it survives refresh, back/forward, and any
//      subsequent route navigation.
//    • While reviewReached is true, WizardShell passes fromReview=true to
//      WizardFooter for every non-review step, showing "Back to Review" beside
//      "Continue" at all times.
//
//  Auto-save behaviour:
//    • saveDraft(stepKey) is called by WizardShell on every successful Continue
//      and on Save & Exit.
//    • The draft stores form data, the last active step key, and reviewReached.
//    • On restoration, lastSavedKey is exposed so WizardShell can redirect
//      the user back to where they left off when they visit the bare category URL.
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_KEY = (cat) => `listing_draft_${cat}`;

export function useListingWizard(initialCategory = "", initialCountry = "") {
  const [form, setForm] = useState({
    category: initialCategory,
    country:  initialCountry,
    images:   [],
  });
  const [attempted,      setAttempted]      = useState({});
  const [hydrated,       setHydrated]       = useState(false);
  const [lastSavedKey,   setLastSavedKey]   = useState(null);
  const [reviewReached,  setReviewReached]  = useState(false);

  // ── Restore draft on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!initialCategory) return;

    async function restore() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY(initialCategory));
        if (raw) {
          const saved = JSON.parse(raw);

          // Restore review-navigation mode
          if (saved.reviewReached) setReviewReached(true);

          // Restore image blobs from IndexedDB → create fresh blob URLs
          const imgMeta = Array.isArray(saved.form?.images) ? saved.form.images : [];
          const restoredImages = (
            await Promise.all(
              imgMeta.map(async (meta) => {
                try {
                  const blob = await getBlob(`${initialCategory}/${meta.id}`);
                  if (!blob) return null;
                  return { ...meta, url: URL.createObjectURL(blob) };
                } catch {
                  return null;
                }
              })
            )
          ).filter(Boolean);

          setForm({
            ...saved.form,
            category: initialCategory,
            country:  saved.form?.country || initialCountry,
            images:   restoredImages,
          });

          if (saved.stepKey) setLastSavedKey(saved.stepKey);
        }
      } catch (_) {
        // Corrupt draft — ignore, proceed with clean state
      }
      setHydrated(true);
    }

    restore();
  }, [initialCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Form ──────────────────────────────────────────────────────────────

  const updateForm = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  // ─── Validation ────────────────────────────────────────────────────────

  const isStepValid = useCallback(
    (key) => validateStep(key, form),
    [form],
  );

  // ─── Attempted tracking ────────────────────────────────────────────────

  const attemptStep = useCallback((key) => {
    setAttempted((prev) => ({ ...prev, [key]: true }));
  }, []);

  // ─── Mark review reached ───────────────────────────────────────────────
  //  Called by WizardShell when the user lands on the review step for the
  //  first time. Persists immediately so the flag survives refresh without
  //  waiting for the next saveDraft call.

  const markReviewReached = useCallback(() => {
    if (reviewReached) return; // already set — no-op
    setReviewReached(true);
    if (!initialCategory) return;
    try {
      const raw      = localStorage.getItem(DRAFT_KEY(initialCategory));
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        DRAFT_KEY(initialCategory),
        JSON.stringify({ ...existing, reviewReached: true }),
      );
    } catch (_) {}
  }, [reviewReached, initialCategory]);

  // ─── Draft persistence ─────────────────────────────────────────────────
  //  stepKey = the wizard step key the user is leaving (saved on Continue).
  //  Blob URLs are stripped — they're session-only object references.
  //  Actual blobs live in IndexedDB, keyed by {category}/{imageId}.

  const saveDraft = useCallback((stepKey) => {
    if (!initialCategory) return;
    try {
      localStorage.setItem(
        DRAFT_KEY(initialCategory),
        JSON.stringify({
          form: {
            ...form,
            // Strip blob URLs; only persist serialisable metadata
            images: (form.images || []).map(({ url, ...rest }) => rest), // eslint-disable-line no-unused-vars
          },
          stepKey:      stepKey || null,
          reviewReached,
        }),
      );
    } catch (_) {}
  }, [form, initialCategory, reviewReached]);

  // ─── Clear draft ───────────────────────────────────────────────────────
  //  Removes both the localStorage entry and all IndexedDB blobs for this
  //  category (called on Submit to clean up after a successful listing).

  const clearDraft = useCallback(() => {
    if (!initialCategory) return;
    try { localStorage.removeItem(DRAFT_KEY(initialCategory)); } catch (_) {}
    deleteByPrefix(`${initialCategory}/`).catch(() => {});
  }, [initialCategory]);

  return {
    form,
    updateForm,
    attempted,
    attemptStep,
    isStepValid,
    hydrated,
    lastSavedKey,
    reviewReached,
    markReviewReached,
    saveDraft,
    clearDraft,
  };
}
