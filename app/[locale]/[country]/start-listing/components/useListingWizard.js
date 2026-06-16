"use client";

import { useState, useCallback, useEffect } from "react";
import { validateStep } from "./wizardConfig";
import { getBlob, deleteByPrefix } from "./imageStore";

// ─────────────────────────────────────────────────────────────────────────────
//  useListingWizard — form state, validation, draft persistence, dirty tracking.
//
//  === DRAFT STRATEGY ===
//  Active draft:    localStorage at DRAFT_KEY(cat) — always the in-progress one.
//  Archived drafts: each at ARCHIVE_KEY(id); catalog index at CATALOG_KEY.
//  archiveDraft()   snapshots the active draft into the catalog so the user can
//                   start a new listing without losing their old one.
//  deleteDraft()    wipes the active draft without archiving.
//
//  === DIRTY TRACKING ===
//  formDirty flips true on any updateForm call and back to false after saveDraft
//  or resetForm.  WizardShell reads this to gate back-navigation / beforeunload.
//
//  === MULTI-DRAFT CATALOG ===
//  getDraftsForCategory(cat) — standalone exported helper — reads the catalog so
//  list/page.jsx can show a draft selector before routing to the wizard.
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_KEY   = (cat) => `listing_draft_${cat}`;
const ARCHIVE_KEY = (id)  => `listing_draft_archive_${id}`;
const CATALOG_KEY = "vb_drafts_catalog";

// ── Step ordering (mirrors WIZARD_STEPS, avoids circular import) ──────────
const STEP_ORDER = ["basics","location","amenities","capacity","pricing","media","review"];

// ── Standalone helpers (usable outside the hook) ─────────────────────────

/** Returns all drafts (active + archived) for a given category. */
export function getDraftsForCategory(cat) {
  try {
    const active = (() => {
      const raw = localStorage.getItem(DRAFT_KEY(cat));
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d?.stepKey) return null;
      return {
        id: `active_${cat}`, isActive: true, category: cat,
        title: d.form?.title || "", stepKey: d.stepKey,
        savedAt: d.savedAt || null, percent: d.percent || 0,
      };
    })();

    const catalog  = JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]");
    const archived = catalog
      .filter((e) => e.category === cat)
      .map((e) => ({ ...e, isActive: false }));

    const all = [];
    if (active) all.push(active);
    all.push(...archived);
    return all;
  } catch {
    return [];
  }
}

/** Promote an archived draft back to the active slot (returns true on success). */
export function restoreArchivedDraft(cat, archiveId) {
  try {
    const data = localStorage.getItem(ARCHIVE_KEY(archiveId));
    if (!data) return false;
    localStorage.setItem(DRAFT_KEY(cat), data);
    // Remove from catalog
    const catalog = JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]");
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog.filter((e) => e.id !== archiveId)));
    return true;
  } catch {
    return false;
  }
}

/** Delete one archived draft (catalog entry + storage key). */
export function deleteArchivedDraft(archiveId) {
  try {
    localStorage.removeItem(ARCHIVE_KEY(archiveId));
    const catalog = JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]");
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog.filter((e) => e.id !== archiveId)));
  } catch {}
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useListingWizard(initialCategory = "", initialCountry = "") {
  const [form, setForm] = useState({
    category: initialCategory,
    country:  initialCountry,
    images:   [],
  });
  const [attempted,     setAttempted]     = useState({});
  const [hydrated,      setHydrated]      = useState(false);
  const [lastSavedKey,  setLastSavedKey]  = useState(null);
  const [reviewReached, setReviewReached] = useState(false);
  const [hasDraft,      setHasDraft]      = useState(false);

  // Dirty tracking & draft metadata
  const [formDirty,  setFormDirty]  = useState(false);
  const [savedAt,    setSavedAt]    = useState(null);   // ms timestamp of last save
  const [draftTitle, setDraftTitle] = useState("");     // form.title at last save

  // ── Restore draft on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!initialCategory) return;

    async function restore() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY(initialCategory));

        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.stepKey) {
              setHasDraft(true);
              setSavedAt(parsed.savedAt || null);
              setDraftTitle(parsed.form?.title || "");
            }
          } catch (_) {}
        }

        if (raw) {
          const saved = JSON.parse(raw);

          if (saved.reviewReached) setReviewReached(true);

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
        // Corrupt draft — proceed with clean state
      }
      setHydrated(true);
    }

    restore();
  }, [initialCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Form ──────────────────────────────────────────────────────────────

  const updateForm = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setFormDirty(true);
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

  const markReviewReached = useCallback(() => {
    if (reviewReached) return;
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

  const saveDraft = useCallback((stepKey) => {
    if (!initialCategory) return;
    const now     = Date.now();
    const stepIdx = STEP_ORDER.indexOf(stepKey);
    const percent = stepIdx >= 0
      ? Math.round(((stepIdx + 1) / STEP_ORDER.length) * 100)
      : 0;
    try {
      localStorage.setItem(
        DRAFT_KEY(initialCategory),
        JSON.stringify({
          form: {
            ...form,
            images: (form.images || []).map(({ url, ...rest }) => rest), // eslint-disable-line no-unused-vars
          },
          stepKey:      stepKey || null,
          reviewReached,
          savedAt:      now,
          percent,
        }),
      );
      setSavedAt(now);
      setDraftTitle(form.title || "");
      setFormDirty(false);
    } catch (_) {}
  }, [form, initialCategory, reviewReached]);

  // ─── Clear active draft ────────────────────────────────────────────────

  const clearDraft = useCallback(() => {
    if (!initialCategory) return;
    try { localStorage.removeItem(DRAFT_KEY(initialCategory)); } catch (_) {}
    deleteByPrefix(`${initialCategory}/`).catch(() => {});
  }, [initialCategory]);

  // ─── Delete draft (discard, no archive) ───────────────────────────────

  const deleteDraft = useCallback(() => {
    clearDraft();
    setHasDraft(false);
    setSavedAt(null);
    setDraftTitle("");
  }, [clearDraft]);

  // ─── Archive current draft (for "Start New Listing") ──────────────────
  //  Moves the active draft into the catalog so it can be resumed later.

  const archiveDraft = useCallback(() => {
    if (!initialCategory) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY(initialCategory));
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft?.stepKey) return;

      const archiveId = `${initialCategory}_${Date.now()}`;
      localStorage.setItem(ARCHIVE_KEY(archiveId), raw);

      const catalog = (() => {
        try { return JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]"); }
        catch { return []; }
      })();
      catalog.push({
        id:       archiveId,
        category: initialCategory,
        title:    draft.form?.title || "",
        stepKey:  draft.stepKey,
        savedAt:  draft.savedAt || Date.now(),
        percent:  draft.percent || 0,
      });
      localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));

      clearDraft();
    } catch (_) {}
  }, [initialCategory, clearDraft]);

  // ─── Reset form (start fresh — clears without archiving) ──────────────

  const resetForm = useCallback(() => {
    clearDraft();
    setForm({ category: initialCategory, country: initialCountry, images: [] });
    setAttempted({});
    setLastSavedKey(null);
    setReviewReached(false);
    setHasDraft(false);
    setFormDirty(false);
    setSavedAt(null);
    setDraftTitle("");
  }, [initialCategory, initialCountry, clearDraft]);

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
    deleteDraft,
    archiveDraft,
    hasDraft,
    resetForm,
    formDirty,
    savedAt,
    draftTitle,
  };
}
