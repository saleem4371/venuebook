"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter , useSearchParams } from "next/navigation";
import { AlertTriangle, BookmarkCheck, Building2, Loader2, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";

import venueImg from "@/assets/Properties/Venue.png";
import farmstayImg from "@/assets/Properties/Farmstay.png";
import studioImg from "@/assets/Properties/Studio.png";
import workspaceImg from "@/assets/Properties/Workspace.png";
import rentalImg from "@/assets/Properties/Rental.png";
import experienceImg from "@/assets/Properties/Experience.png";

import ProgressBar from "./ProgressBar";
import WizardFooter from "./WizardFooter";
import { useListingWizard } from "./useListingWizard";
import { getBlob, deleteBlob } from "./imageStore";
import {
  WIZARD_STEPS,
  CATEGORY_LABELS,
  STEP_TO_SLUG,
  SLUG_TO_STEP,
} from "./wizardConfig";



import BasicsStep from "./steps/BasicsStep";
import LocationStep from "./steps/LocationStep";
import AmenitiesStep from "./steps/AmenitiesStep";
import CapacityStep from "./steps/CapacityStep";
import PricingStep from "./steps/PricingStep";
import MediaStep from "./steps/MediaStep";
import ReviewStep from "./steps/ReviewStep";

import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/app/[locale]/[country]/home/components/LoginModal";
import { URL_COUNTRY_TO_CODE } from "./steps/config/locationConfig";
import { StepSkeleton, useSkeletonDelay } from "./steps/skeletons/index";

import { getProperty } from "@/services/global.service";
import { listing_create,last_parent_id , listing_sub_check} from "@/services/listing.service";

// ── Utility: human-readable "saved X ago" ────────────────────────────────
function formatSavedAt(ts) {
  if (!ts) return null;
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────────────────────────────────────────────────────── */

const STEP_COMPONENTS = {
  basics: BasicsStep,
  location: LocationStep,
  amenities: AmenitiesStep,
  capacity: CapacityStep,
  pricing: PricingStep,
  media: MediaStep,
  review: ReviewStep,
};

const CAT_IMAGES = {
  venue: venueImg,
  farmstay: farmstayImg,
  studio: studioImg,
  workspace: workspaceImg,
  rental: rentalImg,
  experience: experienceImg,
};

const variants = {
  enter: (d) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
};

/* ─────────────────────────────────────────────────────────────────────── */

export default function WizardShell({ initialCategory }) {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "en";
  const country = params?.country || "in";

useEffect(() => {
  const handlePopState = () => {
    router.replace(`/${locale}/${country}/home`);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [router, locale, country]);

  

  // ── Derive current step from URL slug ──────────────────────────────────
const stepParam = params?.step || "basic-details";

const currentStepKey =
  SLUG_TO_STEP[stepParam] || "basics";

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === currentStepKey);
  const currentStep = WIZARD_STEPS[Math.max(0, stepIndex)];
  const totalSteps = WIZARD_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  // ── URL helpers ────────────────────────────────────────────────────────
  const stepUrl = (key) =>
    `/${locale}/${country}/start-listing/${initialCategory}/${STEP_TO_SLUG[key]}`;

  // ── Local UI state ─────────────────────────────────────────────────────
  const [dir, setDir] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [saving, setSaving] = useState(false);
  // True only while the user is actively editing a step after clicking "Edit"
  // on the review page. Persisted in sessionStorage because router.push to a
  // new [step] URL remounts this component, wiping in-memory state.
  const EDIT_FROM_REVIEW_KEY = `vb_edit_from_review_${initialCategory}`;
  const [editingFromReview, setEditingFromReview] = useState(() => {
    try { return sessionStorage.getItem(`vb_edit_from_review_${initialCategory}`) === "1"; }
    catch { return false; }
  });

  // Auth
  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [parentId, setParentId] = useState(false);
  const [parentVenueName, setParentVenueName] = useState("");
  const pendingSave = useRef(false);

  // ISO code for initial map center
  const urlCountry = URL_COUNTRY_TO_CODE[country.toLowerCase()] || "IN";

  // Dark mode sync
  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // ── Wizard state ───────────────────────────────────────────────────────
  const {
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
  } = useListingWizard(initialCategory, urlCountry);

  // ── Auto-restore: redirect to last active step on bare category URL ────
  // Fires once after hydration. Uses router.replace so no extra history entry.

  // ── Mark review reached on landing ────────────────────────────────────
  // Fires whenever the user is on the review step (including on refresh or
  // direct URL visit). markReviewReached is idempotent — safe to call every
  // render while on the review step.
  useEffect(() => {
    if (currentStep.key === "review" && hydrated) {
      markReviewReached();
    }
  }, [currentStep.key, hydrated, markReviewReached]);

  // ── Draft recovery modal state (Rule 5) ────────────────────────────────
  const [showDraftModal, setShowDraftModal] = useState(false);

  // Rule 5: show "Continue Your Listing?" once per session when draft exists
  useEffect(() => {
    if (!hydrated || !hasDraft || !lastSavedKey || stepIndex !== 0) return;
    const sessionKey = `draft_modal_shown_${initialCategory}`;
    if (sessionStorage.getItem(sessionKey)) return;
    setShowDraftModal(true);
  }, [hydrated, hasDraft, lastSavedKey, stepIndex, initialCategory]);

  const handleContinueDraft = () => {
    setShowDraftModal(false);
    sessionStorage.setItem(`draft_modal_shown_${initialCategory}`, "1");
    router.push(stepUrl(lastSavedKey));
  };

  // "Start New" — archive the old draft so it can be resumed later
  const handleStartFresh = () => {
    setShowDraftModal(false);
    sessionStorage.setItem(`draft_modal_shown_${initialCategory}`, "1");
    archiveDraft();
    resetForm();
  };

  // "Delete Draft" — discard without archiving
  const handleDeleteDraft = () => {
    setShowDraftModal(false);
    sessionStorage.setItem(`draft_modal_shown_${initialCategory}`, "1");
    deleteDraft();
    resetForm();
  };

  // Rule 3: step sequence guard — redirect URL-jumpers to earliest incomplete step
  useEffect(() => {
    if (!hydrated) return;
    const maxAllowed = lastSavedKey
      ? WIZARD_STEPS.findIndex((s) => s.key === lastSavedKey) + 1
      : 0;
    if (stepIndex > maxAllowed) {
      router.replace(stepUrl(WIZARD_STEPS[maxAllowed].key));
    }
  }, [hydrated, lastSavedKey, stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Unsaved changes: warn before tab close / refresh (item 2) ────────
  useEffect(() => {
    if (!hydrated || !formDirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hydrated, formDirty]);

  // ── Unsaved changes: internal navigation guard modal (item 2) ─────────
  const [showLeaveModal,  setShowLeaveModal]  = useState(false);
  const pendingNavAction = useRef(null); // stores () => void to run if user confirms leave

  const guardedNav = useCallback((navFn) => {
    if (formDirty) {
      pendingNavAction.current = navFn;
      setShowLeaveModal(true);
    } else {
      navFn();
    }
  }, [formDirty]);

  const handleLeaveConfirm = () => {
    setShowLeaveModal(false);
    pendingNavAction.current?.();
    pendingNavAction.current = null;
  };

  const handleLeaveCancel = () => {
    setShowLeaveModal(false);
    pendingNavAction.current = null;
  };

  // ── Session expiry auto-save (item 6) ─────────────────────────────────
  // When isLoggedIn flips false mid-wizard (expired token / forced logout),
  // save the draft and store the return URL so we can resume after re-login.
  const prevLoggedIn = useRef(isLoggedIn);
  useEffect(() => {
    if (prevLoggedIn.current && !isLoggedIn && hydrated) {
      // Session just expired — auto-save
      saveDraft(currentStep.key);
      try {
        sessionStorage.setItem("vb_return_after_login", window.location.pathname);
      } catch (_) {}
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Register global save hook for logout protection (item 11) ─────────
  // UserDropdown and Navbar call window.__vb_save_draft?.() before logout.
  useEffect(() => {
    window.__vb_save_draft = () => saveDraft(currentStep.key);
    return () => { window.__vb_save_draft = null; };
  }); // runs every render so currentStep.key stays current

  // ── Browser back on step 1: go to /list instead of browser history (item 13) ──
  useEffect(() => {
    if (!isFirst) return;
    // Push a sentinel state so popstate fires on browser back
    window.history.pushState({ wizardStep: "basics" }, "");
    const onPop = () => {
      // Re-push so rapid back-clicks don't escape the wizard
      window.history.pushState({ wizardStep: "basics" }, "");
      router.push(`/${locale}/${country}/list`);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isFirst, locale, country, router]);

  // ── Continue debounce: prevent double-click navigation (item 14) ──────
  const navigatingRef = useRef(false);

  const isCurrentValid = isStepValid(currentStep.key);

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleNext = () => {
    attemptStep(currentStep.key);
    if (!isCurrentValid) return;
    // Debounce: prevent double-click submitting two navigations (item 14)
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setTimeout(() => { navigatingRef.current = false; }, 600);

    // Auto-save on every successful Continue (items 1, 5, 7)
    saveDraft(currentStep.key);

    // Leaving via Continue clears the "editing from review" context
    try { sessionStorage.removeItem(EDIT_FROM_REVIEW_KEY); } catch (_) {}
    setEditingFromReview(false);

    const next = WIZARD_STEPS[stepIndex + 1];
    if (!next) return;
    setDir(1);
    router.push(stepUrl(next.key));
  };

  const _doBack = useCallback(() => {
    // Leaving via Back also clears the "editing from review" context
    try { sessionStorage.removeItem(EDIT_FROM_REVIEW_KEY); } catch (_) {}
    setEditingFromReview(false);
    if (isFirst) {
      router.push(`/${locale}/${country}/list`);
      return;
    }
    const prev = WIZARD_STEPS[stepIndex - 1];
    setDir(-1);
    router.push(stepUrl(prev.key));
  }, [isFirst, stepIndex, locale, country, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrap back in the unsaved-changes guard (item 2)
  const handleBack = () => guardedNav(_doBack);

  // Called by ReviewStep "Edit" buttons — persists the flag in sessionStorage
  // so it survives the remount caused by navigating to a different [step] URL.
  const handleGoToStep = (index) => {
    const step = WIZARD_STEPS[index];
    if (!step) return;
    const dir = index < stepIndex ? -1 : 1;
    guardedNav(() => {
      try { sessionStorage.setItem(EDIT_FROM_REVIEW_KEY, "1"); } catch (_) {}
      setEditingFromReview(true);
      setDir(dir);
      router.push(stepUrl(step.key));
    });
  };

  // Footer "Back to Review" — clear flag and navigate to review step
  const handleBackToReview = () => {
    try { sessionStorage.removeItem(EDIT_FROM_REVIEW_KEY); } catch (_) {}
    setEditingFromReview(false);
    setDir(1);
    router.push(stepUrl("review"));
  };

  const handleSubmit = async () => {
     const resp_check = await listing_sub_check(form.category);
    try {
      console.log("FORM:", form);

      const formData = new FormData();

      /* -------------------------------------------------------------------------- */
      /*                               BASIC FIELDS                                 */
      /* -------------------------------------------------------------------------- */

      formData.append("parent_venue_id", parentId || "");
      formData.append("title", form.title || "");
      formData.append("description", form.description || "");
      formData.append("category", form.category || "");
      formData.append("subcategory", String(form.subcategory || ""));

      formData.append("address", form.address || "");
      formData.append("city", form.city || "");
      formData.append("state", form.state || "");
      formData.append("country", form.country || "");
      formData.append("pincode", form.pincode || "");

      /* -------------------------------------------------------------------------- */
      /*                                  LOCATION                                  */
      /* -------------------------------------------------------------------------- */

      formData.append("lat", String(form.lat || ""));
      formData.append("lng", String(form.lng || ""));

      /* -------------------------------------------------------------------------- */
      /*                                  CAPACITY                                  */
      /* -------------------------------------------------------------------------- */

      formData.append(
        "capacity_minGuests",
        String(form.capacity?.minGuests || 0),
      );

      formData.append(
        "capacity_maxGuests",
        String(form.capacity?.maxGuests || 0),
      );

      formData.append("capacity_setting", JSON.stringify(form.capacity));

      /* -------------------------------------------------------------------------- */
      /*                                 AMENITIES                                  */
      /* -------------------------------------------------------------------------- */

      (form.amenities || []).forEach((item) => {
        formData.append("amenities[]", item);
      });

      /* -------------------------------------------------------------------------- */
      /*                              PRICING SHIFTS                                */
      /* -------------------------------------------------------------------------- */

      if (form.category == "venue") {
        if (form.pricing?.shifts) {
          Object.entries(form.pricing.shifts).forEach(([shift, data]) => {
            formData.append(
              `pricing[shifts][${shift}][enabled]`,
              String(data?.enabled || false),
            );

            formData.append(
              `pricing[shifts][${shift}][price]`,
              String(data?.price || 0),
            );
          });
        }
      } 
      
formData.append("pricing", JSON.stringify(form.pricing));
      formData.append("security_deposit", form.pricing.deposit);
      // formData.append("mode", JSON.stringify(form));
      formData.append("mode", form.pricing.mode);

      

      /* -------------------------------------------------------------------------- */
      /*                              FILE RESOLVER                                 */
      /* -------------------------------------------------------------------------- */

      const resolveFile = async (img) => {
        // Fresh uploaded file
        if (img.file instanceof File) {
          return img.file;
        }

        // Restore from IndexedDB
        if (img.localKey) {
          const blob = await getBlob(img.localKey);

          console.log("RESTORED BLOB:", blob);

          // IMPORTANT
          if (blob instanceof File) {
            return blob;
          }

          if (blob instanceof Blob) {
            return new File([blob], img.name || "image.jpg", {
              type: blob.type || "image/jpeg",
            });
          }
        }

        return null;
      };

      /* -------------------------------------------------------------------------- */
      /*                                   IMAGES                                   */
      /* -------------------------------------------------------------------------- */

      for (const img of form.images || []) {
        const file = await resolveFile(img);

        if (!file) continue;

        formData.append("images[]", file);
      }

      /* -------------------------------------------------------------------------- */
      /*                                COVER IMAGE                                 */
      /* -------------------------------------------------------------------------- */

      const coverImage = form.images?.find((img) => img.cover);

      if (coverImage) {
        const coverFile = await resolveFile(coverImage);

        if (coverFile) {
          formData.append("cover_image", coverFile);
        }
      }

      /* -------------------------------------------------------------------------- */
      /*                              DEBUG FORMDATA                                */
      /* -------------------------------------------------------------------------- */

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1], pair[1] instanceof File);
      }

      /* -------------------------------------------------------------------------- */
      /*                                  API CALL                                  */
      /* -------------------------------------------------------------------------- */

      const res = await listing_create(formData);
//
      // ── Scenario 8: mark pending subscription so VendorAuthGuard can redirect
      // back to the payment page instead of /list if user exits before paying.
      try { localStorage.setItem("vb_pending_category", form.category); } catch (_) {}
      // Clear the edit-from-review session flag on successful submission
      try { sessionStorage.removeItem(EDIT_FROM_REVIEW_KEY); } catch (_) {}

      clearDraft();

  

if (Array.isArray(resp_check.data) && resp_check.data.length > 0) {
  router.push(
    `/${encodeURIComponent(locale)}/${encodeURIComponent(country)}/vendor/listing`
  );
} else {
  setTimeout(() => {
    router.push(
      `/${encodeURIComponent(locale)}/${encodeURIComponent(country)}/start-listing/${encodeURIComponent(form.category)}/payment`
    );
  }, 800);
}


      /* -------------------------------------------------------------------------- */
      /*                           CLEAN TEMP INDEXEDDB                             */
      /* -------------------------------------------------------------------------- */

      for (const img of form.images || []) {
        if (img?.localKey) {
          await deleteBlob(img.localKey);
        }
      }
    } catch (error) {
      console.error("SUBMIT ERROR:", error);
      // Re-throw so WizardFooter can reset its submitting state on failure
      throw error;
    }
  };

  // ── Save & Exit (auth-gated) ───────────────────────────────────────────
  const doSaveAndExit = () => {
    setSaving(true);
    try {
      saveDraft(currentStep.key);
      toast.success("Progress saved! Continue any time.", {
        icon: "🔖",
        style: { borderRadius: "12px", fontSize: "13px", fontWeight: "500" },
      });
      setTimeout(() => router.push(`/${locale}/${country}/list`), 800);
    } catch (_) {
      setSaving(false);
    }
  };

  const handleSaveAndExit = () => {
    if (saving) return;
    if (!isLoggedIn) {
      pendingSave.current = true;
      setShowLogin(true);
      return;
    }
    doSaveAndExit();
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingSave.current) {
      pendingSave.current = false;
      doSaveAndExit();
    }
  };

  const catLabel = CATEGORY_LABELS[form.category] || form.category || "";
  const catImage = CAT_IMAGES[form.category] || null;
  const StepComponent = STEP_COMPONENTS[currentStep.key];

  // "Back to Review" appears only when the user actively navigated here
  // via an Edit button on the review step (editingFromReview), not simply
  // because review was reached at some point in the past.
  const showBackToReview = editingFromReview && !isLast;

  //last_parent_id
  const load = async () => {
    try {
      const addons = await last_parent_id(form.category);
      setParentId(addons?.data);
    } catch (err) {
      console.error("Addons load error:", err);
    }
  };

  useEffect(() => {
    load();
    // Read parent venue name stored by parent-setup on successful submit
    const name = localStorage.getItem("vb_parent_venue_name");
    if (name) setParentVenueName(name);
  }, []);
  

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <LoginModal
        open={showLogin}
        setOpen={setShowLogin}
        onSuccess={handleLoginSuccess}
      />

      {/* ══════════════════════════════════════════════════════════════
          DRAFT RECOVERY MODAL  (items 1 & 5)
          Shown once per session when a saved draft exists on step 1.
      ══════════════════════════════════════════════════════════════ */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center mx-auto">
              <BookmarkCheck size={22} className="text-violet-600 dark:text-violet-400" />
            </div>

            {/* Copy */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Continue your previous listing?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                You have an unfinished listing saved.
              </p>
            </div>

            {/* Draft info card */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 space-y-1.5">
              {draftTitle && (
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {draftTitle}
                </p>
              )}
              {parentVenueName && (
                <div className="flex items-center gap-1.5">
                  <Building2 size={11} strokeWidth={2.2} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
                  <p className="text-xs text-violet-600 dark:text-violet-400 truncate">
                    {parentVenueName}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                {lastSavedKey && (
                  <span className="capitalize">
                    Last step: <span className="font-medium text-gray-700 dark:text-gray-300">{lastSavedKey}</span>
                  </span>
                )}
                {savedAt && (
                  <span>Saved {formatSavedAt(savedAt)}</span>
                )}
              </div>
              {catLabel && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                  {catLabel}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleContinueDraft}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
              >
                Continue listing
              </button>
              {/* <button
                type="button"
                onClick={handleStartFresh}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                Start new listing
              </button> */}
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="w-full min-h-[40px] rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} strokeWidth={2} />
                Delete draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          UNSAVED CHANGES GUARD MODAL  (item 2)
          Shown when user tries to navigate back / away with dirty form.
      ══════════════════════════════════════════════════════════════ */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div className="text-center">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Unsaved changes</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                You've made changes that haven't been saved yet. Your previous draft is still intact.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleLeaveCancel}
                className="flex-1 min-h-[44px] rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleLeaveConfirm}
                className="flex-1 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 transition-all"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 border-b border-transparent">
        <div className="w-full px-5 sm:px-10 py-3.5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Logo is non-navigable inside the listing wizard (Rule 1) */}
            <div
              aria-label="venuebook.in"
              className="flex-shrink-0 select-none"
            >
              <Image
                src={isDark ? darkLogo : lightLogo}
                alt="venuebook.in"
                height={32}
                className="h-7 sm:h-8 w-auto object-contain min-w-[88px]"
                priority
              />
            </div>

            {catLabel && (
              <div className="hidden sm:flex flex-1 items-center justify-center">
                <CategoryTag catImage={catImage} catLabel={catLabel} />
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveAndExit}
              disabled={saving}
              aria-label="Save progress and exit"
              className={[
                "ml-auto flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl",
                "text-sm font-semibold border transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                saving
                  ? "border-violet-200 dark:border-violet-800 text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 cursor-not-allowed"
                  : "cursor-pointer text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30",
              ].join(" ")}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin flex-shrink-0" />
                  <span className="hidden sm:inline">Saving…</span>
                  <span className="sm:hidden">Saving</span>
                </>
              ) : (
                <>
                  <BookmarkCheck size={15} strokeWidth={2} />
                  <span className="hidden sm:inline">Save &amp; Exit</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>

          {catLabel && (
            <div className="flex sm:hidden items-center justify-center pt-3">
              <CategoryTag catImage={catImage} catLabel={catLabel} />
            </div>
          )}
        </div>

        <ProgressBar stepIndex={stepIndex} totalSteps={totalSteps} />
      </header>

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* Parent property badge — centered above content, outside sticky header */}
        {parentVenueName && (
          <div className="flex justify-center pt-5 pb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 select-none">
              <Building2 size={11} strokeWidth={2.2} className="flex-shrink-0" />
              <span className="truncate max-w-[260px] sm:max-w-sm">{parentVenueName}</span>
            </span>
          </div>
        )}
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-10 pb-12">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {currentStep.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Hydration / draft-restore skeleton */}
          {!hydrated ? (
            <div className="sk-fade-in">
              <StepSkeleton stepKey={currentStep.key} />
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={currentStep.key}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <StepComponent
                  form={form}
                  updateForm={updateForm}
                  attempted={attempted}
                  goToStep={handleGoToStep}
                  api={getProperty}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* STICKY FOOTER */}
      <WizardFooter
        isFirst={isFirst}
        isLast={isLast}
        isCurrentValid={isCurrentValid}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        fromReview={showBackToReview}
        onBackToReview={handleBackToReview}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Category tag                                                                */
/* -------------------------------------------------------------------------- */

function CategoryTag({ catImage, catLabel }) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      {catImage && (
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={catImage}
            alt={catLabel}
            width={48}
            height={48}
            quality={95}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 tracking-tight truncate max-w-[160px] sm:max-w-none">
        {catLabel}
      </span>
    </div>
  );
}
