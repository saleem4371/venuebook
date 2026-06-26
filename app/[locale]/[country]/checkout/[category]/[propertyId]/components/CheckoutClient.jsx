"use client";

/**
 * CheckoutClient.jsx
 *
 * Main checkout orchestrator. Manages all state, calculates the invoice in
 * real time, and composes the two-column premium layout.
 *
 * Architecture:
 *   - Left column  → Wallet → BookingDetails → AddOns
 *   - Right column → Sticky BookingSummary (financial breakdown + payment + CTA)
 */

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";
import {
  getCheckoutConfig,
  PLATFORM_FEE_PERCENT,
  TAX_PERCENT,
  POINTS_PER_INR,
  INR_PER_POINT,
  MAX_WALLET_REDEMPTION_PERCENT,
  getMembershipTier,
} from "@/config/checkoutConfig";
import { CATEGORY_TINTS } from "@/config/categoryConfig";

import WalletSection from "./WalletSection";
import BookingDetailsSection from "./BookingDetailsSection";
import AddOnsSection from "./AddOnsSection";
import BookingSummary from "./BookingSummary";

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

  const normCat = normalizeCategory(category);
  const catConfig = getCheckoutConfig(normCat);
  const tint = CATEGORY_TINTS[normCat] ?? CATEGORY_TINTS.venues;
  const ctaKey = ctaTranslationKey(normCat);

  /* ── Wallet state ─────────────────────────────────────────────────── */
  const walletPointsTotal = MOCK_WALLET.points;
  const walletValueINR = walletPointsTotal * INR_PER_POINT;
  const [walletApplied, setWalletApplied] = useState(false);

  /* ── Add-ons state ───────────────────────────────────────────────── */
  const [selectedAddOns, setSelectedAddOns] = useState(new Set());

  const toggleAddOn = useCallback((id) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ── Booking details state ───────────────────────────────────────── */
  const [bookingDetails, setBookingDetails] = useState({});

  const updateBookingDetail = useCallback((key, value) => {
    setBookingDetails((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ── Payment method state ────────────────────────────────────────── */
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

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

  /* ── Handle submit ───────────────────────────────────────────────── */
  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate async payment processing
    setTimeout(() => {
      router.push(
        `/${locale}/${country}/checkout/${category}/${propertyId}/success`
      );
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* ── Top header bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600 dark:text-neutral-400 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tint.hex }}
            />
            <h1 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
              {t("title")}
            </h1>
          </div>

          {/* Progress indicator */}
          <div className="ms-auto flex items-center gap-2 text-xs text-gray-400 dark:text-neutral-500">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: tint.hex }}
            >
              1
            </span>
            <span className="font-medium text-gray-700 dark:text-neutral-300">
              {t("step_booking")}
            </span>
            <span className="mx-1">→</span>
            <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-700">
              2
            </span>
            <span>{t("step_payment")}</span>
            <span className="mx-1">→</span>
            <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 dark:bg-neutral-700">
              3
            </span>
            <span className="hidden sm:inline">{t("step_confirm")}</span>
          </div>
        </div>
      </header>

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex-1 w-full space-y-6">

            {/* Section 1: Wallet */}
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

            {/* Section 2: Booking Details */}
            <BookingDetailsSection
              tint={tint}
              category={normCat}
              bookingDetails={bookingDetails}
              onUpdate={updateBookingDetail}
            />

            {/* Section 3: Add-ons */}
            <AddOnsSection
              tint={tint}
              category={normCat}
              addOns={catConfig.addOns}
              selectedAddOns={selectedAddOns}
              onToggle={toggleAddOn}
              format={format}
            />
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[400px] xl:w-[440px] lg:sticky lg:top-24">
            <BookingSummary
              tint={tint}
              normCat={normCat}
              ctaKey={ctaKey}
              property={MOCK_PROPERTY}
              financials={financials}
              bookingDetails={bookingDetails}
              catConfig={catConfig}
              currentTier={currentTier}
              format={format}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              isProcessing={isProcessing}
              onPay={handlePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
