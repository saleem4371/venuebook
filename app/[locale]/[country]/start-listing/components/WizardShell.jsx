"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter , useSearchParams } from "next/navigation";
import { BookmarkCheck, Loader2 } from "lucide-react";
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
import { listing_create,last_parent_id } from "@/services/listing.service";

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

  // Auth
  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [parentId, setParentId] = useState(false);
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
    hasDraft,
    resetForm,
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

  const handleStartFresh = () => {
    setShowDraftModal(false);
    sessionStorage.setItem(`draft_modal_shown_${initialCategory}`, "1");
    resetForm();
  };

  // Rule 2 & 8: step sequence guard — redirect URL-jumpers to earliest incomplete step
  useEffect(() => {
    if (!hydrated) return;
    const maxAllowed = lastSavedKey
      ? WIZARD_STEPS.findIndex((s) => s.key === lastSavedKey) + 1
      : 0;
    if (stepIndex > maxAllowed) {
      router.replace(stepUrl(WIZARD_STEPS[maxAllowed].key));
    }
  }, [hydrated, lastSavedKey, stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rule 10: warn before tab close / refresh when form has unsaved data
  useEffect(() => {
    if (!hydrated) return;
    const isDirty = !!(
      form.title ||
      form.description ||
      form.address ||
      form.amenities?.length > 0 ||
      form.images?.length > 0
    );
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hydrated, form.title, form.description, form.address, form.amenities, form.images]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrentValid = isStepValid(currentStep.key);

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleNext = () => {
    attemptStep(currentStep.key);
    if (!isCurrentValid) return;

    // Auto-save current step data on every successful Continue
    saveDraft(currentStep.key);

    const next = WIZARD_STEPS[stepIndex + 1];
    if (!next) return;
    setDir(1);
    router.push(stepUrl(next.key));
  };

  const handleBack = () => {
    // Rule 4: first step back → listing landing page
    if (isFirst) {
      router.push(`/${locale}/${country}/list`);
      return;
    }
    const prev = WIZARD_STEPS[stepIndex - 1];
    setDir(-1);
    router.push(stepUrl(prev.key));
  };

  // Called by ReviewStep "Edit" buttons
  const handleGoToStep = (index) => {
    const step = WIZARD_STEPS[index];
    if (!step) return;
    setDir(index < stepIndex ? -1 : 1);
    router.push(stepUrl(step.key));
  };

  // Footer "Back to Review" — navigate directly to review step
  const handleBackToReview = () => {
    setDir(1);
    router.push(stepUrl("review"));
  };

  const handleSubmit = async () => {
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

      clearDraft();
      setTimeout(() => {
        router.push(
          `/${encodeURIComponent(locale)}/${encodeURIComponent(country)}/start-listing/${encodeURIComponent(form.category)}/payment`,
        );
      }, 800);

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
    }
  };

  // ── Save & Exit (auth-gated) ───────────────────────────────────────────
  const doSaveAndExit = () => {
    setSaving(true);
    //handleSubmit();
    saveDraft(currentStep.key);


    toast.success("Progress saved! Continue any time.", {
      icon: "🔖",
      style: { borderRadius: "12px", fontSize: "13px", fontWeight: "500" },
    });
    setTimeout(() => router.push(`/${locale}/${country}/list`), 800);
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

  // "Back to Review" is shown on every non-review step once the user has
  // reached the review step at least once (persisted across refresh).
  const showBackToReview = reviewReached && !isLast;

  //last_parent_id
  const load = async () => {
    try {
      console.log('venues')
      const addons = await last_parent_id(form.category);
      setParentId(addons?.data);

    } catch (err) {
      console.error("Addons load error:", err);
    }
  };
  
    useEffect( () => {
        load();
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
          DRAFT RECOVERY MODAL  (Rule 5)
          Shown once per session when a saved draft is detected on
          the first step.  User can continue from last step or start fresh.
      ══════════════════════════════════════════════════════════════ */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center mx-auto">
              <BookmarkCheck size={22} className="text-violet-600 dark:text-violet-400" />
            </div>

            {/* Copy */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Continue where you left off?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                You have an unfinished listing saved. Pick up from your last step or start over.
              </p>
            </div>

            {/* Last step badge */}
            {lastSavedKey && (
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Last saved step:</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">
                  {lastSavedKey.replace(/-/g, " ")}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleContinueDraft}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
              >
                Continue listing
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="w-full min-h-[44px] rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                Start fresh
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
              aria-label="VenueBook"
              className="flex-shrink-0 select-none"
            >
              <Image
                src={isDark ? darkLogo : lightLogo}
                alt="VenueBook"
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
