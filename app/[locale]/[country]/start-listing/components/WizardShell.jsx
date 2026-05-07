"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookmarkCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import lightLogo from "@/assets/logo.svg";
import darkLogo  from "@/assets/logo.png";

import venueImg      from "@/assets/Properties/Venue.png";
import farmstayImg   from "@/assets/Properties/Farmstay.png";
import studioImg     from "@/assets/Properties/Studio.png";
import workspaceImg  from "@/assets/Properties/Workspace.png";
import rentalImg     from "@/assets/Properties/Rental.png";
import experienceImg from "@/assets/Properties/Experience.png";

import ProgressBar         from "./ProgressBar";
import WizardFooter        from "./WizardFooter";
import { useListingWizard } from "./useListingWizard";
import { CATEGORY_LABELS }  from "./wizardConfig";

import BasicsStep   from "./steps/BasicsStep";
import LocationStep from "./steps/LocationStep";
import DetailsStep  from "./steps/DetailsStep";
import MediaStep    from "./steps/MediaStep";
import PricingStep  from "./steps/PricingStep";
import ReviewStep   from "./steps/ReviewStep";

/* ─────────────────────────────────────────────────────────────────────── */

const STEP_COMPONENTS = {
  basics: BasicsStep, location: LocationStep, details: DetailsStep,
  media: MediaStep,   pricing: PricingStep,   review:  ReviewStep,
};

/* Category image map — thumbnail used in the header tag */
const CAT_IMAGES = {
  venue: venueImg, farmstay: farmstayImg, studio: studioImg,
  workspace: workspaceImg, rental: rentalImg, experience: experienceImg,
};

const variants = {
  enter:  (d) => ({ x: d > 0 ?  48 : -48, opacity: 0 }),
  center:       { x: 0, opacity: 1 },
  exit:   (d) => ({ x: d > 0 ? -48 :  48, opacity: 0 }),
};

/* ─────────────────────────────────────────────────────────────────────── */

export default function WizardShell({ initialCategory }) {
  const params  = useParams();
  const router  = useRouter();
  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  const [dir,    setDir]    = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const {
    stepIndex, totalSteps, currentStep, progress,
    form, updateForm, attempted, isCurrentValid,
    isFirst, isLast, goNext, goBack, goToStep,
    saveDraft, clearDraft,
  } = useListingWizard(initialCategory);

  const handleNext     = () => { setDir(1);  goNext(); };
  const handleBack     = () => { setDir(-1); goBack(); };
  const handleGoToStep = (i) => { setDir(i < stepIndex ? -1 : 1); goToStep(i); };
  const handleSubmit   = () => { clearDraft(); router.push(`/${locale}/${country}/vendor/dashboard`); };

  const handleSaveAndExit = () => {
    if (saving) return;
    setSaving(true);
    saveDraft();
    toast.success("Progress saved! Continue any time.", {
      icon: "🔖",
      style: { borderRadius: "12px", fontSize: "13px", fontWeight: "500" },
    });
    setTimeout(() => router.push(`/${locale}/${country}/list`), 800);
  };

  const catLabel      = CATEGORY_LABELS[form.category] || form.category || "";
  const catImage      = CAT_IMAGES[form.category] || null;
  const StepComponent = STEP_COMPONENTS[currentStep.key];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      {/* ══════════════════════════════════════════════════════════════
          STICKY HEADER — full width, no max-w constraint
          Mobile:  Row 1 = Logo + Save & Exit | Row 2 = Category tag
          Desktop: Logo · Category (center) · Save & Exit
      ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 border-b border-transparent">

        <div className="w-full px-5 sm:px-10 py-3.5 sm:py-4">

          {/* ── Primary row: Logo + (desktop center slot) + Save & Exit ── */}
          <div className="flex items-center gap-3 sm:gap-6">

            {/* Logo — flex-shrink-0 prevents compression */}
            <Link
              href={`/${locale}/${country}/home`}
              aria-label="VenueBook home"
              className="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
            >
              <Image
                src={isDark ? darkLogo : lightLogo}
                alt="VenueBook"
                height={32}
                className="h-7 sm:h-8 w-auto object-contain min-w-[88px]"
                priority
              />
            </Link>

            {/* Center slot — desktop only: category tag */}
            {catLabel && (
              <div className="hidden sm:flex flex-1 items-center justify-center">
                <CategoryTag catImage={catImage} catLabel={catLabel} />
              </div>
            )}

            {/* Save & Exit — pushed to far right */}
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

          {/* ── Secondary row: mobile-only category tag ── */}
          {catLabel && (
            <div className="flex sm:hidden items-center justify-center pt-3">
              <CategoryTag catImage={catImage} catLabel={catLabel} />
            </div>
          )}

        </div>

        {/* Thin segmented progress bar — flush at header bottom */}
        <ProgressBar stepIndex={stepIndex} totalSteps={totalSteps} />

      </header>

      {/* ══════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT — max-w on content only
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-10 pb-12">

          {/* Step heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {currentStep.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Animated step body */}
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
              />
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          STICKY FOOTER — full width
      ══════════════════════════════════════════════════════════════ */}
      <WizardFooter
        isFirst={isFirst}
        isLast={isLast}
        isCurrentValid={isCurrentValid}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Category tag — flat inline style: thumbnail + label, no card border   */
/* ─────────────────────────────────────────────────────────────────────── */

function CategoryTag({ catImage, catLabel }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {catImage && (
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
          <Image
            src={catImage}
            alt={catLabel}
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px] sm:max-w-none">
        {catLabel}
      </span>
    </div>
  );
}
