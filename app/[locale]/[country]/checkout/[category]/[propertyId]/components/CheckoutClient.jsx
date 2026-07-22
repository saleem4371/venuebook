"use client";

/**
 * CheckoutClient.jsx
 *
 * Main checkout orchestrator. Manages all state, calculates the invoice in
 * real time, and composes the 2-step wizard + sticky pricing sidebar.
 *
 * Architecture:
 *   - CheckoutProgressSteps → 3-step indicator (step 3 = the separate /success route)
 *   - Step 1 "Review"   → BookingReviewCard → Wallet (skipped for venues) →
 *                          AddOns
 *   - Step 2 "Checkout" → ContactForm → PaymentOptions (when advance payment
 *                          is enabled for the category)
 *   - Right column      → Sticky BookingSummary (financial breakdown, terms
 *                          gate, step-aware CTA) across both steps
 */

import { useState, useCallback, useMemo,useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter,useSearchParams } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";

import { startPayment } from "@/services/cashfree.service";

import {
  loadVenues,
  loadAddons,
} from "@/services/venue_details.service";


import {
  getCheckoutConfig,
  PLATFORM_FEE_PERCENT,
  TAX_PERCENT,
  POINTS_PER_INR,
  INR_PER_POINT,
  MAX_WALLET_REDEMPTION_PERCENT,
  getMembershipTier,
  LEGAL_DEFAULTS,
} from "@/config/checkoutConfig";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

import WalletSection from "./WalletSection";
import AddOnsSection from "./AddOnsSection";
import BookingSummary from "./BookingSummary";
import BookingReviewCard from "./BookingReviewCard";
import ContactForm from "./ContactForm";
import PaymentOptionsSection from "./PaymentOptionsSection";
import CheckoutProgressSteps from "./CheckoutProgressSteps";
import TermsModal from "./TermsModal";

/* ─── Mock data (replace with API calls in production) ─────────────── */
const MOCK_PROPERTY = {
  name: "The Grand Willow Estate",
  parentName: "Willow Hospitality Group",
  location: "Lonavala, Maharashtra, India",
  image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  basePriceINR: 45000,
};

const MOCK_WALLET = {
  points: 12500,
  tier: "gold",
};

/* ─── Category → category key mapping ──────────────────────────────── */
// Config keys are plural (venues, farmstays…); URL params may vary
function normalizeCategory(cat) {
  const map = {
    venue: "venues", venues: "venues",
    farmstay: "farmstays", farmstays: "farmstays",
    studio: "studios", studios: "studios",
    workspace: "workspaces", workspaces: "workspaces",
    rental: "rentals", rentals: "rentals",
    experience: "experiences", experiences: "experiences",
  };
  return map[cat?.toLowerCase()] ?? "venues";
}

/* ─── CTA key → singular for translation lookup ────────────────────── */
function ctaTranslationKey(normalizedCategory) {
  return normalizedCategory.replace(/s$/, "");
}

export default function CheckoutClient({ locale, country, category, propertyId }) {
  const t = useTranslations("checkout");
  const { format } = useCurrency();
  const router = useRouter();

  const [images,  SetImages]  = useState([]);
  const [venueData,  SetVenueData]  = useState({});
  const [venueshifts,  SetVenueshifts]  = useState([]);
  const [venueEvents,  SetVenueEvents]  = useState([]); 
 const [venueSettings,  SetvenueSettings]  = useState([]);
 const [addons,  SetAddons]  = useState([]);
 const [addonsLoading, setAddonsLoading] = useState(true);

  const searchParams = useSearchParams();

  const booking = {
    eventType: searchParams.get("eventType"),
    bookingType: searchParams.get("bookingType"),
    guests: Number(searchParams.get("guests") || 0),
    date: searchParams.get("date"),
    shift: searchParams.get("shift"),
    venueName: searchParams.get("venueName"),
    venueId: searchParams.get("venueId"),
    category: searchParams.get("category"),
    checkIn: searchParams.get("checkIn"),
    checkOut: searchParams.get("checkOut"),
  };

  console.log(venueshifts);

  const normCat = normalizeCategory(category);
  const catConfig = getCheckoutConfig(normCat);
  const tint = CATEGORY_TINTS[normCat] ?? CATEGORY_TINTS.venues;
  const ctaKey = ctaTranslationKey(normCat);

  /* ── Wallet state ─────────────────────────────────────────────────── */
  const walletPointsTotal = MOCK_WALLET.points;
  const walletValueINR = walletPointsTotal * INR_PER_POINT;
  const [walletApplied, setWalletApplied] = useState(false);

  /* ── Add-ons state ───────────────────────────────────────────────── */
  // const [selectedAddOns, setSelectedAddOns] = useState(new Set());
  const [selectedAddOns, setSelectedAddOns] = useState(new Map());
  const [addonSummary, setAddonSummary] = useState({
  unitTotal: 0,
  flatTotal: 0,
  grandTotal: 0,
});

const [paymentSummarys, setPaymentSummary] = useState(null);

  // const toggleAddOn = useCallback((id) => {
  //   setSelectedAddOns((prev) => {
  //     const next = new Set(prev);
  //     next.has(id) ? next.delete(id) : next.add(id);
  //     return next;
  //   });
  // }, []);

// Paste this in the parent component that owns `selectedAddOns`
// (wherever you currently have: const [selectedAddOns, setSelectedAddOns] = useState(new Map());)

const toggleAddOn = (addon, action = "toggle") => {
  setSelectedAddOns((prev) => {
    const next = new Map(prev);
    const existing = next.get(addon.add_on_id);

    if (addon.type === "unit") {
      const qty = existing?.qty || 0;

      if (action === "add") {
        const newQty = Math.min(qty + 1, addon.stock ?? Infinity);
        next.set(addon.add_on_id, { addon, qty: newQty });
      }

      if (action === "remove") {
        if (qty <= 1) next.delete(addon.add_on_id);
        else next.set(addon.add_on_id, { addon, qty: qty - 1 });
      }
    } else {
      if (existing) next.delete(addon.add_on_id);
      else next.set(addon.add_on_id, { addon, qty: 1 });
    }

    return next;
  });
};
  /* ── Booking details state ─────────────────────────────────────────
     Category-specific extras (shoot date, seats, etc. for categories that
     don't have URL-param booking data). Read-only at checkout now that the
     editable Booking Details form was removed as duplicate of the review
     card above it and the special-requests field in ContactForm. */
  const [bookingDetails] = useState({});

  /* ── Payment state ───────────────────────────────────────────────── */
  const [isProcessing, setIsProcessing] = useState(false);

  /* ── Terms & Conditions modal state ──────────────────────────────── */
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsTab, setTermsTab] = useState("terms");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const openTerms = useCallback((tab = "terms") => {
    setTermsTab(tab);
    setTermsOpen(true);
  }, []);

  /* ── Step wizard state ───────────────────────────────────────────────
     Step 1 = Review (recap + wallet + booking details + add-ons)
     Step 2 = Checkout (contact info + payment options)
     Step 3 = Confirmation — a separate route (the existing /success page),
     reached after handlePayment() redirects post-gateway-callback.        */
  const [currentStep, setCurrentStep] = useState(1);

  /* ── Contact form state ──────────────────────────────────────────── */
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    specialRequests: "",
  });
  const [contactErrors, setContactErrors] = useState({});

  const updateContactField = useCallback((field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateContactField = useCallback((field) => {
    setContactErrors((prev) => {
      const next = { ...prev };
      const value = contactForm[field];
      if (field === "fullName" && !value?.trim()) next.fullName = t("contact.error_required");
      else if (field === "fullName") delete next.fullName;

      if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? "")) next.email = t("contact.error_email");
      else if (field === "email") delete next.email;

      if (field === "phone" && !/^\d{10}$/.test(value ?? "")) next.phone = t("contact.error_phone");
      else if (field === "phone") delete next.phone;

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactForm, t]);

  const isContactValid =
    contactForm.fullName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email) &&
    /^\d{10}$/.test(contactForm.phone);

  /* ── Payment type state (full vs advance) ────────────────────────── */
  const [paymentType, setPaymentType] = useState("full");

  /* ── Price calculations ──────────────────────────────────────────── */
  const financials = useMemo(() => {
    const baseINR = MOCK_PROPERTY.basePriceINR;

    const addOnsINR = catConfig.addOns
      .filter((a) => selectedAddOns.has(a.id))
      .reduce((sum, a) => sum + a.priceINR, 0);

    const subtotalBeforeFees = baseINR + addOnsINR;
    const platformFeeINR = Math.round(subtotalBeforeFees * PLATFORM_FEE_PERCENT);
    const taxINR = Math.round(subtotalBeforeFees * TAX_PERCENT);
    const subtotalWithFees = subtotalBeforeFees + platformFeeINR + taxINR;

    const maxRedeemableINR = Math.min(
      walletValueINR,
      Math.round(subtotalWithFees * MAX_WALLET_REDEMPTION_PERCENT)
    );

    const rewardDiscountINR = walletApplied ? maxRedeemableINR : 0;
    const pointsUsed = walletApplied
      ? Math.ceil(maxRedeemableINR / INR_PER_POINT)
      : 0;

    const depositINR = catConfig.depositApplies ? (catConfig.depositAmountINR ?? 5000) : 0;
    const totalINR = subtotalWithFees - rewardDiscountINR + depositINR;

    const pointsEarned = Math.floor(totalINR * POINTS_PER_INR);
    const remainingPoints = walletPointsTotal - pointsUsed;

    return {
      baseINR,
      addOnsINR,
      platformFeeINR,
      taxINR,
      subtotalWithFees,
      rewardDiscountINR,
      pointsUsed,
      remainingPoints,
      maxRedeemableINR,
      depositINR,
      totalINR,
      pointsEarned,
    };
  }, [selectedAddOns, walletApplied, catConfig, walletValueINR, walletPointsTotal]);

  /* ── Tier progress ───────────────────────────────────────────────── */
  const currentTier = getMembershipTier(walletPointsTotal);
  const nextTierIndex = currentTier.nextAt
    ? [0, 5000, 15000, 30000].indexOf(currentTier.nextAt)
    : -1;

  /* ── Step navigation ─────────────────────────────────────────────── */
  const goToStep = useCallback((step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleProceedToCheckout = useCallback(() => {
    if (!termsAccepted) return;
    goToStep(2);
  }, [termsAccepted, goToStep]);

  const handleHeaderBack = useCallback(() => {
    if (currentStep === 2) {
      goToStep(1);
    } else {
      // Step 1 back should return to wherever the user came from — the
      // property detail page they booked from — not a fixed destination.
      // router.back() replays browser history instead of guessing a URL.
      router.back();
    }
  }, [currentStep, goToStep, router]);

  /* ── Handle submit ───────────────────────────────────────────────── */
const handlePayment = async () => {
  if (!isContactValid) {
    validateContactField("fullName");
    validateContactField("email");
    validateContactField("phone");
    return;
  }

  const grandTotal = paymentSummarys?.grandTotal ?? financials.totalINR;
  const amount =
    paymentType === "advance"
      ? Math.round(grandTotal * ((catConfig?.advancePercent ?? 30) / 100))
      : grandTotal;

  if (!amount) {
    console.error("Payment amount not ready yet");
    return;
  }

  setIsProcessing(true);

  try {
    await startPayment({
      bookingId: `${propertyId}-${Date.now()}`,
      amount,
      customer: {
        id: propertyId ?? `guest-${Date.now()}`,
        name: contactForm.fullName,
        email: contactForm.email,
        phone: contactForm.phone,
      },
      url:`${locale}/${country}/checkout/${category}/${propertyId}/success`
    });

    setTimeout(() => {
      router.push(`/${locale}/${country}/checkout/${category}/${propertyId}/success`);
    }, 1800);
  } catch (err) {
    console.error("Payment error:", err);
    setIsProcessing(false);
  }
};

    useEffect(() => {
      if (!propertyId) return;
      let cancelled = false;

      const load = async () => {
        setAddonsLoading(true);
        try {
          const [res,resp] = await Promise.all([
              loadVenues(propertyId),
              loadAddons(propertyId),
            // getGalleryCategory(listingId),
          ]);
          if (cancelled) return;
          if (res?.data) SetImages(res.data.gallery);
          if (res?.data) SetVenueData(res.data.venues);
          if (res?.data) SetVenueshifts(res.data.shifts);
          if (res?.data) SetVenueEvents(res.data.events);
          if (res?.data) SetvenueSettings(res.data.venue_settings);
          if (resp?.data) SetAddons(resp.data);
          // if (resCt?.data) setCategory(resCt.data);
        } catch (err) {
          if (!cancelled) console.error("Listing load error:", err);
        } finally {
          if (!cancelled) setAddonsLoading(false);
        }
      };



      load();
      return () => { cancelled = true; };
    }, [propertyId]);


  return (
    <div className="min-h-screen pt-16 md:pt-[72px] bg-white dark:bg-gray-950">
      {/* ── Main content ───────────────────────────────────────────────
          Back button + title live inline with the content column instead
          of a separate bordered/backdrop-blurred bar — no boxed strip,
          just flush with the page background. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 lg:pb-12">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 lg:mb-12">
          <button
            onClick={handleHeaderBack}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-700 dark:text-gray-300 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {currentStep === 1 ? t("review_title") : t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {currentStep === 1 ? t("review_subtitle") : t("checkout_subtitle")}
            </p>
          </div>
        </div>

        <CheckoutProgressSteps tint={tint} currentStep={currentStep} onStepClick={goToStep} />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex-1 w-full min-w-0 space-y-4 sm:space-y-6">

            {currentStep === 1 ? (
              <>
                {/* Step 1 — Review: property recap */}
                <BookingReviewCard
                  tint={tint}
                  normCat={normCat}
                  booking={booking}
                  bookingDetails={bookingDetails}
                  venueData={venueData}
                  images={images}
                  loading={addonsLoading}
                />

                {/* Wallet — venues don't participate in the loyalty/rewards
                    program at checkout; every other category (incl. farmstays) does. */}
                {normCat !== "venues" && (
                  <WalletSection
                    tint={tint}
                    pointsTotal={walletPointsTotal}
                    walletValueINR={walletValueINR}
                    maxRedeemableINR={financials.maxRedeemableINR}
                    walletApplied={walletApplied}
                    onToggleWallet={setWalletApplied}
                    rewardDiscountINR={financials.rewardDiscountINR}
                    remainingPoints={financials.remainingPoints}
                    currentTier={currentTier}
                    format={format}
                  />
                )}

                <AddOnsSection
                  tint={tint}
                  category={normCat}
                  addOns={catConfig.addOns}
                  selectedAddOns={selectedAddOns}
                  onToggle={toggleAddOn}
                  format={format}
                  addons={addons}
                  onTotalChange={setAddonSummary}
                  loading={addonsLoading}
                />
              </>
            ) : (
              <>
                {/* Step 2 — Checkout: contact info + payment method */}
                <ContactForm
                  tint={tint}
                  formData={contactForm}
                  errors={contactErrors}
                  onChange={updateContactField}
                  onBlur={validateContactField}
                />

                {catConfig.allowAdvancePayment && (
                  <PaymentOptionsSection
                    tint={tint}
                    format={format}
                    total={paymentSummarys?.grandTotal ?? financials.totalINR}
                    advancePercent={catConfig.advancePercent}
                    paymentType={paymentType}
                    onChangePaymentType={setPaymentType}
                  />
                )}
              </>
            )}
          </div>
          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[400px] xl:w-[440px] lg:sticky lg:top-24">
            <BookingSummary
              tint={tint}
              normCat={normCat}
              ctaKey={ctaKey}
              financials={financials}
              catConfig={catConfig}
              currentTier={currentTier}
              format={format}
              isProcessing={isProcessing}
              onPay={handlePayment}
              venueData={venueData}
              booking={booking}
              venueshifts={venueshifts}
              venueSettings={venueSettings}
              addonSummary={addonSummary}
              onSummaryChange={setPaymentSummary}
              onOpenTerms={openTerms}
              currentStep={currentStep}
              termsAccepted={termsAccepted}
              onToggleTerms={setTermsAccepted}
              onProceed={handleProceedToCheckout}
              paymentType={paymentType}
              disablePay={currentStep === 2 && !isContactValid}
              walletApplied={walletApplied}
            />
          </div>
        </div>
      </div>

      {/* ── Terms & Conditions / Cancellation Policy modal ─────────────── */}
      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        defaultTab={termsTab}
        tint={tint}
        termsText={LEGAL_DEFAULTS.termsText}
        privacyText={LEGAL_DEFAULTS.privacyText}
        cancellationText={catConfig.cancellationText}
        cancellationRule={catConfig.cancellationRule}
        onAccept={currentStep === 1 ? () => setTermsAccepted(true) : undefined}
      />
    </div>
  );
}
