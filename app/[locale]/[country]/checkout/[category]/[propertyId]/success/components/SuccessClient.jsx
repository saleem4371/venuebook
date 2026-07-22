"use client";

/**
 * SuccessClient.jsx
 *
 * Post-payment confirmation page.
 * Identical layout for every category — only the detail section changes.
 *
 * Sections:
 *   1. Hero — animated checkmark + booking ref
 *   2. Category-specific details
 *   3. Loyalty celebration
 *   4. Action buttons
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { getMembershipTier, MEMBERSHIP_TIERS } from "@/config/checkoutConfig";
import { useCurrency } from "@/hooks/useCurrency";

import { useParams , usePathname} from "next/navigation";

import { checkoutSuccess } from '@/services/checkout.service'

/* ─── Mock booking data (replace with session/API in production) ────── */
const MOCK_BOOKING = {
  ref: "VB-2025-XKJM7",
  property: "The Grand Willow Estate",
  location: "Lonavala, Maharashtra",
  vendor: { name: "Amit Sharma", phone: "+91 98765 43210" },
  totalINR: 58200,
  pointsEarned: 11640,
  newPointsTotal: 24140,
};

/* ─── Category-specific detail panels ────────────────────────────────── */
function VenueDetails({ t }) {
  return (
    <InfoCard
      icon="🎊"
      title={t("venue.event_summary")}
      items={[
        { label: "Event", value: "Wedding Reception" },
        { label: "Date", value: "15 March 2025, Evening" },
        { label: "Guests", value: "150 guests confirmed" },
        { label: "Vendor", value: MOCK_BOOKING.vendor.name },
        { label: "Contact", value: MOCK_BOOKING.vendor.phone },
      ]}
    />
  );
}

function FarmstayDetails({ t }) {
  return (
    <InfoCard
      icon="🌿"
      title={t("farmstay.stay_details")}
      items={[
        { label: "Check-in", value: "12 Mar 2025, 2:00 PM" },
        { label: "Check-out", value: "14 Mar 2025, 11:00 AM" },
        { label: "Guests", value: "2 Adults" },
        { label: "Route", value: "Get directions →", link: true },
        { label: "Weather", value: "Partly cloudy, 26°C" },
      ]}
    />
  );
}

function StudioDetails({ t }) {
  return (
    <InfoCard
      icon="🎬"
      title={t("studio.instructions")}
      items={[
        { label: "Date", value: "18 Mar 2025" },
        { label: "Time", value: "10:00 AM – 2:00 PM" },
        { label: "Access", value: "Gate 3, Level 2" },
        { label: "Equipment", value: "Ready at reception" },
        { label: "Contact", value: MOCK_BOOKING.vendor.phone },
      ]}
    />
  );
}

function WorkspaceDetails({ t }) {
  return (
    <InfoCard
      icon="💼"
      title={t("workspace.access")}
      items={[
        { label: "Date", value: "20 Mar 2025, 9 AM – 5 PM" },
        { label: "Seats", value: "4 seats, Table B3" },
        { label: "Access", value: "QR code sent to email" },
        { label: "WiFi", value: "VB_Guest / vb2025#" },
        { label: "Support", value: MOCK_BOOKING.vendor.phone },
      ]}
    />
  );
}

function RentalDetails({ t }) {
  return (
    <InfoCard
      icon="🚗"
      title={t("rental.pickup")}
      items={[
        { label: "Pickup", value: "MG Road, Bangalore" },
        { label: "Start", value: "22 Mar 2025, 8:00 AM" },
        { label: "Return", value: "24 Mar 2025, 8:00 PM" },
        { label: "Documents", value: "Valid DL + Aadhar required" },
        { label: "Contact", value: MOCK_BOOKING.vendor.phone },
      ]}
    />
  );
}

function ExperienceDetails({ t }) {
  return (
    <InfoCard
      icon="🏕️"
      title={t("experience.meeting_point")}
      items={[
        { label: "Date", value: "25 Mar 2025, 6:00 AM" },
        { label: "Meeting Point", value: "Basecamp Gate, NH-48" },
        { label: "Participants", value: "4 confirmed" },
        { label: "Guide", value: "Ravi Kumar (Certified)" },
        { label: "Guide Contact", value: MOCK_BOOKING.vendor.phone },
      ]}
    />
  );
}

function InfoCard({ icon, title, items }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-gray-400 dark:text-neutral-500">{item.label}</span>
            <span className={`font-medium text-end ${item.link ? "text-blue-600 dark:text-blue-400 underline cursor-pointer" : "text-gray-700 dark:text-neutral-300"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Category → component map ──────────────────────────────────────── */
const DETAIL_MAP = {
  venues:      VenueDetails,
  farmstays:   FarmstayDetails,
  studios:     StudioDetails,
  workspaces:  WorkspaceDetails,
  rentals:     RentalDetails,
  experiences: ExperienceDetails,
};

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

/* ─── Animated checkmark ────────────────────────────────────────────── */
function SuccessCheck({ tint }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 animate-ping"
        style={{ backgroundColor: tint.hex }}
      />
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: tint.hex }}
      >
        <svg
          className={`w-12 h-12 text-white transition-all duration-700 ${drawn ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Loyalty celebration ───────────────────────────────────────────── */
function LoyaltyCelebration({ t, format }) {
  const newTier = getMembershipTier(MOCK_BOOKING.newPointsTotal);
  const nextTierObj = MEMBERSHIP_TIERS.find((m) => m.minPoints > MOCK_BOOKING.newPointsTotal);
  const progressPercent = nextTierObj
    ? Math.min(100, Math.round(((MOCK_BOOKING.newPointsTotal - newTier.minPoints) / (nextTierObj.minPoints - newTier.minPoints)) * 100))
    : 100;

  return (
    <div className="rounded-2xl overflow-hidden border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 dark:from-violet-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="p-5 space-y-4">
        {/* Points earned */}
        <div className="text-center">
          <p className="text-xs font-medium text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-1">
            🎉 {t("points_earned")}
          </p>
          <p className="text-4xl font-bold text-violet-900 dark:text-violet-100">
            +{MOCK_BOOKING.pointsEarned.toLocaleString()}
          </p>
          <p className="text-sm text-violet-600 dark:text-violet-300 mt-1">
            {t("new_balance")}: {MOCK_BOOKING.newPointsTotal.toLocaleString()} pts
          </p>
        </div>

        {/* Tier badge */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: `${newTier.color}22` }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ backgroundColor: newTier.color }}
          >
            {newTier.label[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
              {newTier.label} Member
            </p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {t("achievements")}: {newTier.label} Status Maintained
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {nextTierObj && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-violet-600 dark:text-violet-400">
              <span>{newTier.label}</span>
              <span>{t("tier_progress")} → {nextTierObj.label}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-violet-200 dark:bg-violet-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-center text-violet-500 dark:text-violet-400">
              {(nextTierObj.minPoints - MOCK_BOOKING.newPointsTotal).toLocaleString()} pts to {nextTierObj.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────── */
export default function SuccessClient({ locale, country, category, propertyId }) {
  const t = useTranslations("checkout_success");
  const router = useRouter();
  const { format } = useCurrency();

  const pathname = usePathname();
  const venueId = pathname.split("/")[5];

  const [ checkout , SetCheckout] =  useState(null);





  const normCat = normalizeCategory(category);
  const tint = CATEGORY_TINTS[normCat] ?? CATEGORY_TINTS.venues;
  const CategoryDetails = DETAIL_MAP[normCat] ?? VenueDetails;

  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard?.writeText(MOCK_BOOKING.ref).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  useEffect(() => {
       if (!venueId) return;
    let cancelled = false;
       const load = async () => {
         try {
           const [res] = await Promise.all([
               checkoutSuccess(venueId)
           ]);
           if (res?.data) SetCheckout(res.data);
         } catch (err) {
           if (!cancelled) console.error("Listing load error:", err);
         } finally {
           // if (!cancelled) setIsPageLoading(false);
         }
       };
 
   
   
       load();
       return () => { cancelled = true; };
     }, [venueId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Subtle top accent */}
      <div className="h-1 w-full" style={{ backgroundColor: tint.hex }} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <SuccessCheck tint={tint} />

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-neutral-100">
              {t("title")} ✨
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
              {t("subtitle")}
            </p>
          </div>

          {/* Booking reference */}
          <div
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border"
            style={{ borderColor: tint.border, backgroundColor: tint.light }}
          >
            <div className="text-start">
              <p className="text-xs text-gray-500 dark:text-neutral-400">{t("ref_label")}</p>
              <p className="text-base font-mono font-bold tracking-wider" style={{ color: tint.hex }}>
                {venueId}
              </p>
            </div>
            <button
              onClick={copyRef}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity text-gray-500 dark:text-neutral-400"
              aria-label="Copy booking reference"
            >
              {copied ? (
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Property summary strip ──────────────────────────────────── */}
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&q=80"
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            alt={MOCK_BOOKING.property}
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-neutral-100 text-sm truncate">
              {MOCK_BOOKING.property}
            </p>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{MOCK_BOOKING.location}</p>
            <p className="text-sm font-bold mt-1" style={{ color: tint.hex }}>
              {format(MOCK_BOOKING.totalINR)} paid
            </p>
          </div>
        </div>

        {/* ── Category-specific details ────────────────────────────────── */}
        <CategoryDetails t={t} />

        {/* ── Loyalty celebration ──────────────────────────────────────── */}
        <LoyaltyCelebration t={t} format={format} />

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t("download_invoice")}
          </button>
          <button
            onClick={() => window.open(`https://wa.me/${MOCK_BOOKING.vendor.phone.replace(/\D/g, "")}`, "_blank")}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: "#25d366" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t("whatsapp_vendor")}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/${locale}/${country}/profile`)}
            className="py-3 px-4 rounded-xl border text-sm font-medium text-center transition-colors border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            {t("view_booking")}
          </button>
          <button
            onClick={() => router.push(`/${locale}/${country}/home`)}
            className="py-3 px-4 rounded-xl text-white text-sm font-semibold text-center transition-all"
            style={{ backgroundColor: tint.hex }}
          >
            {t("return_home")}
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
