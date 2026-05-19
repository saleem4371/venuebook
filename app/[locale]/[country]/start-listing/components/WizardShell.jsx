"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookmarkCheck } from "lucide-react";
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

import { getProperty } from "@/services/global.service";
import { listing_create } from "@/services/listing.service";

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
    if (isFirst) return;
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
        "capacity[minGuests]",
        String(form.capacity?.minGuests || 0),
      );

      formData.append(
        "capacity[maxGuests]",
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

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <LoginModal
        open={showLogin}
        setOpen={setShowLogin}
        onSuccess={handleLoginSuccess}
      />

      {/* ══════════════════════════════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 border-b border-transparent">
        <div className="w-full px-5 sm:px-10 py-3.5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href={`/${locale}/${country}/home`}
              aria-label="VenueBook home"
              className="flex-shrink-0 transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
            >
              <Image
                src={isDark ? darkLogo : lightLogo}
                alt="VenueBook"
                height={32}
                className="h-7 sm:h-8 w-auto object-contain min-w-[88px]"
                priority
              />
            </Link>

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
                  ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
                  : "cursor-pointer text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30",
              ].join(" ")}
            >
              <BookmarkCheck size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Save &amp; Exit</span>
              <span className="sm:hidden">Save</span>
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

      {/* ══════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT
      ══════════════════════════════════════════════════════════════ */}
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
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          STICKY FOOTER
      ══════════════════════════════════════════════════════════════ */}
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

/* ─────────────────────────────────────────────────────────────────────── */
/*  Category tag                                                            */
/* ─────────────────────────────────────────────────────────────────────── */

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