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
 *   3. Loyalty celebration (skipped for venues — same rule as checkout)
 *   4. Action buttons
 *
 * NOTE: This version consumes the real `checkoutSuccess(venueId)` response
 * instead of the hardcoded MOCK_BOOKING object (the previous version fetched
 * `checkout` into state but never actually used it anywhere in the render).
 */

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams, usePathname } from "next/navigation";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { getMembershipTier, MEMBERSHIP_TIERS } from "@/config/checkoutConfig";
import { useCurrency } from "@/hooks/useCurrency";

import { checkoutSuccess } from "@/services/checkout.service";

/* ─── Helpers ─────────────────────────────────────────────────────────
 * The API can return either a single booking object or an array
 * containing one (as in the sample payload). Normalize either shape
 * into a single flat object the rest of the component can rely on.
 */
function normalizeBooking(raw) {
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) return null;

  const amount = Number.parseFloat(item.amount ?? 0) || 0;
  const paidAmount = Number.parseFloat(item.paid_amount ?? 0) || 0;

  // Loyalty points aren't returned by this endpoint yet. Until there's a
  // dedicated loyalty API, we estimate earned points as a flat 20% of the
  // paid amount (matches the ratio used by the old mock data) so the
  // celebration card still has something meaningful to show.
  const pointsEarned = Math.round(amount * 0.2);

  return {
    ref: item.refNo ?? "—",
    property: item.venue_name ?? "—",
    location: [item.venue_address, item.venue_city].filter(Boolean).join(", "),
    image: item.venue_image || item.logo || null,
    vendor: {
      name: item.venue_name ?? "Vendor",
      phone: item.phone ?? "",
      email: item.email ?? "",
    },
    customer: item.customer ?? null,
    totalPax: item.total_pax ?? null,
    eventType: item.eventType ?? null,
    fromDate: item.fromDate ?? null,
    toDate: item.toDate ?? null,
    shift: item.shift ?? null,
    workflowState: item.workflowState ?? null,
    amount,
    paidAmount,
    pointsEarned,
    // We don't yet know the customer's running loyalty total, so treat
    // this booking's points as the running total for tier-progress purposes.
    newPointsTotal: pointsEarned,
  };
}

function formatDateTime(iso, { dateOnly = false } = {}) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(dateOnly ? {} : { hour: "numeric", minute: "2-digit" }),
    });
  } catch {
    return iso;
  }
}

/* ─── Category-specific detail panels ────────────────────────────────── */
function VenueDetails({ t, booking }) {
  return (
    <InfoCard
      icon="🎊"
      title={t("venue.event_summary")}
      items={[
        { label: "Event", value: booking.eventType ?? "—" },
        {
          label: "Date",
          value: `${formatDateTime(booking.fromDate, { dateOnly: true })}${
            booking.shift ? `, ${booking.shift}` : ""
          }`,
        },
        {
          label: "Guests",
          value: booking.totalPax
            ? `${booking.totalPax} guests confirmed`
            : "—",
        },
        { label: "Customer Name", value: booking.customer.name },
        { label: "Contact", value: booking.customer.phone || "—" },
      ]}
    />
  );
}

function FarmstayDetails({ t, booking }) {
  return (
    <InfoCard
      icon="🌿"
      title={t("farmstay.stay_details")}
      items={[
        { label: "Check-in", value: formatDateTime(booking.fromDate) },
        { label: "Check-out", value: formatDateTime(booking.toDate) },
        {
          label: "Guests",
          value: booking.totalPax ? `${booking.totalPax}` : "—",
        },
        { label: "Route", value: "Get directions →", link: true },
        { label: "Contact", value: booking.customer.phone || "—" },
      ]}
    />
  );
}

function StudioDetails({ t, booking }) {
  return (
    <InfoCard
      icon="🎬"
      title={t("studio.instructions")}
      items={[
        {
          label: "Date",
          value: formatDateTime(booking.fromDate, { dateOnly: true }),
        },
        {
          label: "Time",
          value: `${formatDateTime(booking.fromDate).split(", ").pop()} – ${formatDateTime(
            booking.toDate,
          )
            .split(", ")
            .pop()}`,
        },
        { label: "Access", value: "Details sent to your email" },
        { label: "Equipment", value: "Ready at reception" },
        { label: "Contact", value: booking.customer.phone || "—" },
      ]}
    />
  );
}

function WorkspaceDetails({ t, booking }) {
  return (
    <InfoCard
      icon="💼"
      title={t("workspace.access")}
      items={[
        { label: "Date", value: formatDateTime(booking.fromDate) },
        {
          label: "Seats",
          value: booking.totalPax ? `${booking.totalPax} seats` : "—",
        },
        { label: "Access", value: "QR code sent to email" },
        { label: "Support", value: booking.customer.phone || "—" },
      ]}
    />
  );
}

function RentalDetails({ t, booking }) {
  return (
    <InfoCard
      icon="🚗"
      title={t("rental.pickup")}
      items={[
        { label: "Pickup", value: booking.location || "—" },
        { label: "Start", value: formatDateTime(booking.fromDate) },
        { label: "Return", value: formatDateTime(booking.toDate) },
        { label: "Documents", value: "Valid DL + Aadhar required" },
        { label: "Contact", value: booking.customer.phone || "—" },
      ]}
    />
  );
}

function ExperienceDetails({ t, booking }) {
  return (
    <InfoCard
      icon="🏕️"
      title={t("experience.meeting_point")}
      items={[
        { label: "Date", value: formatDateTime(booking.fromDate) },
        { label: "Meeting Point", value: booking.location || "—" },
        {
          label: "Participants",
          value: booking.totalPax ? `${booking.totalPax} confirmed` : "—",
        },
        { label: "Guide", value: booking.customer.name },
        { label: "Guide Contact", value: booking.customer.phone || "—" },
      ]}
    />
  );
}

function InfoCard({ icon, title, items }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-gray-400 dark:text-gray-500">
              {item.label}
            </span>
            <span
              className={`font-medium text-end ${
                item.link
                  ? "text-blue-600 dark:text-blue-400 underline cursor-pointer"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
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
  venues: VenueDetails,
  farmstays: FarmstayDetails,
  studios: StudioDetails,
  workspaces: WorkspaceDetails,
  rentals: RentalDetails,
  experiences: ExperienceDetails,
};

function normalizeCategory(cat) {
  const map = {
    venue: "venues",
    venues: "venues",
    farmstay: "farmstays",
    farmstays: "farmstays",
    studio: "studios",
    studios: "studios",
    workspace: "workspaces",
    workspaces: "workspaces",
    rental: "rentals",
    rentals: "rentals",
    experience: "experiences",
    experiences: "experiences",
  };
  return map[cat?.toLowerCase()] ?? "venues";
}

/* ─── Animated checkmark ────────────────────────────────────────────── */
function SuccessCheck({ tint }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
  );
}

/* ─── Loyalty celebration ───────────────────────────────────────────── */
function LoyaltyCelebration({ t, booking }) {
  const newTier = getMembershipTier(booking.newPointsTotal);
  const nextTierObj = MEMBERSHIP_TIERS.find(
    (m) => m.minPoints > booking.newPointsTotal,
  );
  const progressPercent = nextTierObj
    ? Math.min(
        100,
        Math.round(
          ((booking.newPointsTotal - newTier.minPoints) /
            (nextTierObj.minPoints - newTier.minPoints)) *
            100,
        ),
      )
    : 100;

  return (
    <div className="rounded-2xl overflow-hidden border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 dark:from-violet-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="p-5 space-y-4">
        <div className="text-center">
          <p className="text-xs font-medium text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-1">
            🎉 {t("points_earned")}
          </p>
          <p className="text-4xl font-bold text-violet-900 dark:text-violet-100">
            +{booking.pointsEarned.toLocaleString()}
          </p>
          <p className="text-sm text-violet-600 dark:text-violet-300 mt-1">
            {t("new_balance")}: {booking.newPointsTotal.toLocaleString()} pts
          </p>
        </div>

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
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {newTier.label} Member
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("achievements")}: {newTier.label} Status Maintained
            </p>
          </div>
        </div>

        {nextTierObj && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-violet-600 dark:text-violet-400">
              <span>{newTier.label}</span>
              <span>
                {t("tier_progress")} → {nextTierObj.label}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-violet-200 dark:bg-violet-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-center text-violet-500 dark:text-violet-400">
              {(
                nextTierObj.minPoints - booking.newPointsTotal
              ).toLocaleString()}{" "}
              pts to {nextTierObj.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Loading state ─────────────────────────────────────────────────── */
function SuccessLoading({ tint }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16 md:pt-[72px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${tint.hex}33`, borderTopColor: tint.hex }}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading your booking…
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────── */
export default function SuccessClient({
  locale,
  country,
  category,
  propertyId,
}) {
  const t = useTranslations("checkout_success");
  const router = useRouter();
  const { format } = useCurrency();

  const pathname = usePathname();
  const venueId = pathname.split("/")[5];

  const [checkout, setCheckout] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const normCat = normalizeCategory(category);
  const tint = CATEGORY_TINTS[normCat] ?? CATEGORY_TINTS.venues;
  const CategoryDetails = DETAIL_MAP[normCat] ?? VenueDetails;

  const [copied, setCopied] = useState(false);

  const booking = useMemo(() => normalizeBooking(checkout), [checkout]);

  const copyRef = () => {
    if (!booking) return;
    navigator.clipboard?.writeText(booking.ref).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await checkoutSuccess(venueId);
        if (!cancelled && res?.data) setCheckout(res.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Checkout success load error:", err);
          setLoadError(true);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  if (!booking) {
    return <SuccessLoading tint={tint} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16 md:pt-[72px]">
      <div className="h-1 w-full" style={{ backgroundColor: tint.hex }} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <SuccessCheck tint={tint} />

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("title")} ✨
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {t("subtitle")}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border"
            style={{ borderColor: tint.border, backgroundColor: tint.light }}
          >
            <div className="text-start">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("ref_label")}
              </p>
              <p
                className="text-base font-mono font-bold tracking-wider"
                style={{ color: tint.hex }}
              >
                {booking.ref}
              </p>
            </div>
            <button
              onClick={copyRef}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity text-gray-500 dark:text-gray-400"
              aria-label="Copy booking reference"
            >
              {copied ? (
                <svg
                  className="h-4 w-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Property summary strip ──────────────────────────────────── */}
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <img
            src={
              booking.image ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&q=80"
            }
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            alt={booking.property}
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {booking.property}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {booking.location}
            </p>
            <p className="text-sm font-bold mt-1" style={{ color: tint.hex }}>
              {format(booking.amount)} paid
            </p>
          </div>
        </div>

        {/* ── Category-specific details ────────────────────────────────── */}
        <CategoryDetails t={t} booking={booking} />

        {/* ── Loyalty celebration ──────────────────────────────────────── */}
        {/* Venue bookings don't participate in the loyalty/rewards program
            (same rule as checkout itself); every other category does. */}
        {normCat !== "venues" && <LoyaltyCelebration t={t} booking={booking} />}

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="truncate">{t("download_invoice")}</span>
          </button>
          <button
            onClick={() => router.push(`/${locale}/${country}/profile`)}
            className="py-3 px-3 rounded-xl border text-sm font-medium text-center truncate transition-colors border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("view_booking")}
          </button>
          <button
            onClick={() => router.push(`/${locale}/${country}/home`)}
            className="py-3 px-3 rounded-xl text-white text-sm font-semibold text-center truncate transition-all"
            style={{ backgroundColor: tint.hex }}
          >
            {t("return_home")}
          </button>
        </div>

        {loadError && (
          <p className="text-center text-xs text-red-500 dark:text-red-400">
            Some booking details may be out of date — please refresh or check
            "My Bookings".
          </p>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
