"use client";

/**
 * WalletSection.jsx
 *
 * Section 1 of checkout: VenueBook Rewards Wallet.
 * Shows tier, points, wallet value, max redeemable, a redemption picker
 * (None / 50% / Max / Custom), and a redemption summary breaking down
 * balance → redeemed → remaining → ₹ discount.
 *
 * TIER DATA: `rewards` is the live payload from the API, shaped as
 * { loyaltyTier: {...}, rewardBalance: [{...}] }.
 * - `rewardBalance[0].available_points` is the guest's actual point
 *   BALANCE they can burn.
 * - `loyaltyTier.burn_coin` is the tier's PER-BOOKING redeem CAP in
 *   points (e.g. "you may redeem at most 2000 points on one booking"),
 *   independent of how many points the guest actually has.
 * - `loyaltyTier.point_value` is the conversion rate: how many points
 *   equal ₹1 (e.g. point_value = 10 → 10 points = ₹1).
 *
 * REDEMPTION MATH:
 * The amount a guest can actually redeem is never just the tier cap —
 * it's whichever is SMALLER: the tier cap, or what's left in their
 * balance. Every preset/custom/summary value is built off that
 * effective cap, not the raw tier cap alone.
 *
 * LIVE HEADER (fix in this pass): the header "Reward Points" badge and
 * the "Wallet Value" stat used to always show the guest's full,
 * unchanged balance — clicking 50%/Max only updated the summary panel
 * further down, which read as broken. Both now show BALANCE MINUS
 * WHATEVER IS CURRENTLY SELECTED, live, the instant a preset/custom
 * value is picked — the same number the summary panel calls
 * "remaining", just surfaced at the top too.
 *
 * DESIGN PASS (this pass): ONLY the None / 50% / Max / Custom picker's
 * visual style changed — clearer, standard-looking buttons with an
 * unmistakable "selected" highlight (solid filled background + check
 * icon) instead of the old faint tinted-border look. No selection
 * logic, math, or click handlers were touched.
 */

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";

// hex → rgba, used to derive a soft tier-tinted badge background straight
// from the API's own `color` hex instead of a hardcoded Tailwind class per
// tier — so any tier color the backend sends "just works" without needing
// a matching class added here every time a new tier is introduced.
function hexToRgba(hex, alpha) {
  const h = (hex || "").replace("#", "");
  const bigint = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  if (Number.isNaN(bigint)) return `rgba(156,163,175,${alpha})`;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// API icon names are kebab-case ("circle-star"); lucide-react components
// are PascalCase ("CircleStar"). Converts the former to the latter so the
// tier icon can be looked up directly off the `LucideIcons` namespace
// instead of maintaining a manual name→component map here.
function toPascalCase(str) {
  return (str || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// ── Animated number ─────────────────────────────────────────────────────
// Tweens a number from its previous value to the next one over `duration`
// ms using requestAnimationFrame + an ease-out curve, instead of jumping
// straight to the new value. Used anywhere a ₹ amount or point count can
// change instantly (redeem picker, tier swap, initial load) so the guest
// sees the count roll rather than flicker.
function useAnimatedNumber(value, duration = 500) {
  const [display, setDisplay] = useState(value ?? 0);
  const frameRef = useRef(null);
  const fromRef = useRef(value ?? 0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    const from = fromRef.current;

    if (from === target) {
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const current = from + (target - from) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        setDisplay(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}

// Fallback labels shown until these keys exist in your next-intl messages
// file. `useTranslations` throws/prints the raw dotted key
// ("checkout.wallet.summary_balance") when a key is missing — this wrapper
// catches that and shows a readable string instead, so the UI never
// regresses to exposing i18n keys. Once you add the real translations,
// `t(key)` will return them and these fallbacks are simply never used.
const FALLBACKS = {
  title: "Your Rewards",
  tier: "Tier",
  points: "Reward Points",
  wallet_value: "Wallet Value",
  max_redeemable: "Max Redeemable",
  redeem_label: "Redeem Points",
  redeem_none: "None",
  redeem_half: "50%",
  redeem_max: "Max",
  redeem_custom: "Custom",
  points_suffix: "pts",
  custom_max_hint: "Up to {amount}",
  summary_title: "Redemption Summary",
  summary_balance: "Points balance",
  summary_redeeming: "Redeeming",
  summary_remaining: "Remaining after redemption",
  summary_discount: "Discount applied",
  summary_rate_hint: "{rate} points = ₹1",
  applied: "Reward applied",
  saved: "you saved",
};

function useSafeTranslations(namespace) {
  const t = useTranslations(namespace);
  return (key, values) => {
    try {
      const result = t(key, values);
      // next-intl returns the key itself (or throws, depending on config)
      // when a message is missing — treat both the same way.
      if (!result || result === key || result.includes(`${namespace}.`)) {
        throw new Error("missing message");
      }
      return result;
    } catch {
      let fallback = FALLBACKS[key] ?? key;
      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          fallback = fallback.replace(`{${k}}`, v);
        });
      }
      return fallback;
    }
  };
}

export default function WalletSection({
  tint,
  pointsTotal,
  walletValueINR,
  maxRedeemableINRs,
  redeemAmountINRs,
  onSelectRedeemAmount,
  rewardDiscountINR,
  remainingPoints,
  currentTier,
  format,
  rewards,
  loading = false,
}) {
  const t = useSafeTranslations("checkout.wallet");

  // ── LIVE TIER ROW ──────────────────────────────────────────────────────
  const reward = rewards?.rewardBalance?.[0];
  const loyaltyTier = rewards?.loyaltyTier;

  // Points shown in the header badge / used as the redeemable balance:
  // `available_points` is what's actually left to spend (total_points
  // includes already-redeemed/expired points, which isn't spendable).
  const resolvedPointsTotal = reward?.available_points ?? pointsTotal ?? 0;

  // Conversion rate: how many points equal ₹1. Defaults to 1:1 only if
  // the tier genuinely doesn't specify one, so we never divide by zero.
  const pointRate = loyaltyTier?.point_value || 1;
  const pointsToINR = (points) => (points || 0) / pointRate;

  // Tier's raw per-booking redeem cap, in points — NOT yet checked
  // against the guest's actual balance.
  const tierCapPoints = maxRedeemableINRs ?? loyaltyTier?.burn_coin ?? 0;

  // The real ceiling on what a guest can redeem is whichever is smaller —
  // the tier's cap, or their available balance.
  const effectiveMaxRedeemable = Math.max(
    0,
    Math.min(tierCapPoints, resolvedPointsTotal),
  );

  // The guest's selection, clamped to that same effective cap.
  const selectedRedeemPoints = Math.max(
    0,
    Math.min(effectiveMaxRedeemable, redeemAmountINRs ?? 0),
  );

  const walletApplied = selectedRedeemPoints > 0;

  // Tier identity: prefer the live row's own name/color/icon over the
  // static `currentTier` prop.
  const resolvedTier = reward
    ? {
        id: (reward.name || "bronze").toLowerCase(),
        label: reward.name,
        color: reward.color,
        icon: reward.icon,
      }
    : currentTier;

  const [customOpen, setCustomOpen] = useState(false);
  const halfValue = Math.round(effectiveMaxRedeemable * 0.5);

 const REDEEM_PRESETS = [
  {
    key: "none",
    name: "None",
  },
  {
    key: "half",
    name: "50%",
  },
  {
    key: "max",
    name: "Max",
  },
];

  const tierColors = {
    bronze:  { bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-400",  dot: "#cd7f32" },
    silver:  { bg: "bg-gray-100 dark:bg-gray-800/50",   text: "text-gray-600 dark:text-gray-300",   dot: "#9ca3af" },
    gold:    { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", dot: "#f59e0b" },
    diamond: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400", dot: "#818cf8" },
  };

  const tc = tierColors[resolvedTier?.id] ?? tierColors.bronze;
  const tierDotColor = resolvedTier?.color ?? tc.dot;
  const tierBadgeStyle = resolvedTier?.color
    ? { backgroundColor: hexToRgba(resolvedTier.color, 0.14), color: resolvedTier.color }
    : undefined;

  const TierIcon = LucideIcons[toPascalCase(resolvedTier?.icon)];

  // ── Derived redemption numbers ───────────────────────────────────────
  const redemptionValueINR = pointsToINR(selectedRedeemPoints);

  const remainingPointsAfter = resolvedPointsTotal - selectedRedeemPoints;
  const remainingWalletValueINR = pointsToINR(remainingPointsAfter);

  // ── Animated display values ──────────────────────────────────────────
  // Header + stats now track the LIVE remaining balance/value (balance
  // minus whatever's currently selected), not the frozen total — so
  // clicking a preset visibly moves both numbers at the top of the card,
  // not just the summary panel below.
  const animatedHeaderPoints = useAnimatedNumber(remainingPointsAfter);
  const animatedWalletValue = useAnimatedNumber(remainingWalletValueINR);
  const animatedMaxRedeemable = useAnimatedNumber(effectiveMaxRedeemable);
  const animatedSelectedPoints = useAnimatedNumber(selectedRedeemPoints);
  const animatedBalance = useAnimatedNumber(resolvedPointsTotal);
  const animatedDiscount = useAnimatedNumber(rewardDiscountINR ?? redemptionValueINR);

  // Brief "press" pulse on whichever control was just clicked, so
  // selecting a preset/custom reads as an immediate action, not just a
  // number quietly rolling somewhere else on the card.
  const [pulseKey, setPulseKey] = useState(null);
const [selectedPreset, setSelectedPreset] = useState("none");

const handleSelect = (amount, key) => {
  const clamped = Math.max(
    0,
    Math.min(effectiveMaxRedeemable, Number(amount) || 0)
  );

  onSelectRedeemAmount(clamped);

  setSelectedPreset(key);

  setPulseKey(key);

  setTimeout(() => {
    setPulseKey(null);
  }, 250);
};

const handlePresetClick = (preset) => {
  setCustomOpen(false);

  let amount = 0;

  switch (preset.key) {
    case "none":
      amount = 0;
      break;

    case "half":
      amount = Math.floor(effectiveMaxRedeemable / 2);
      break;

    case "max":
      amount = effectiveMaxRedeemable;
      break;

    default:
      amount = 0;
  }

  handleSelect(amount, preset.key);
};

const [customAmount, setCustomAmount] = useState("");

  console.log(pulseKey)

  if (loading) {
    return (
      <section
        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
        aria-label="venuebook.in Rewards Wallet"
      >
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
            <div className="min-w-0 space-y-1.5">
              <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
          <div className="text-end shrink-0 space-y-1.5">
            <div className="h-6 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ms-auto" />
            <div className="h-3 w-14 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ms-auto" />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
          {[0, 1].map((n) => (
            <div key={n} className="px-4 sm:px-6 py-4 space-y-2">
              <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-6 py-4">
          <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      aria-label="venuebook.in Rewards Wallet"
    >
      {/* Header stripe */}
      <div
        className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3"
        style={{ background: `linear-gradient(135deg, ${tint.bg}, ${tint.activeBg})`, borderBottom: `1px solid ${tint.border}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0"
            style={{ backgroundColor: tint.hex }}
          >
            {TierIcon ? <TierIcon size={18} strokeWidth={2.25} /> : "✦"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {t("title")}
            </p>
            <div
              className={`mt-0.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                tierBadgeStyle ? "" : `${tc.bg} ${tc.text}`
              }`}
              style={tierBadgeStyle}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: tierDotColor }}
              />
              <span className="truncate">{resolvedTier?.label} {t("tier")}</span>
            </div>
          </div>
        </div>

        {/* Live: total balance minus whatever's currently selected */}
        <div className="text-end shrink-0">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums transition-transform">
            {Math.round(animatedHeaderPoints).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("points")}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 sm:px-6 py-4 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("wallet_value")}</p>
          {/* Live: reflects the balance remaining after the current
              selection, converted through the tier's point rate. */}
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate tabular-nums">
            {format(animatedWalletValue)}
          </p>
        </div>
        <div className="px-4 sm:px-6 py-4 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("max_redeemable")}</p>
          <p className="text-lg font-semibold truncate tabular-nums" style={{ color: tint.hex }}>
            {Math.round(animatedMaxRedeemable).toLocaleString()} {t("points_suffix")}
          </p>
        </div>
      </div>

      {/* Redemption picker — None / Half / Max, not all-or-nothing.
          DESIGN ONLY: buttons now show a solid, unmistakable highlight
          (filled background + check icon) when selected. Click handlers
          and values are exactly the same as before. */}
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("redeem_label")}
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label={t("redeem_label")}
          className="grid grid-cols-3 gap-2"
        >
          <div className="grid grid-cols-3 gap-3">
  {REDEEM_PRESETS.map((preset) => {
    const active =
      !customOpen && selectedPreset === preset.key;

    const pressed = pulseKey === preset.key;

    return (
      <button
        key={preset.key}
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => handlePresetClick(preset)}
        className={`relative rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all duration-150
          ${
            pressed ? "scale-95" : "scale-100"
          }
          ${
            active
              ? "text-white shadow-md"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        style={
          active
            ? {
                backgroundColor: tint.hex,
                borderColor: tint.hex,
              }
            : undefined
        }
      >
        {preset.name}
      </button>
    );
  })}
</div>
        </div>

        <button
          type="button"
          role="radio"
          aria-checked={customOpen}
          onClick={() => setCustomOpen(true)}
          className={`mt-2 w-full rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            pulseKey === "redeem_custom" ? "scale-[0.98]" : "scale-100"
          } ${
            customOpen
              ? "text-white shadow-md"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60"
          }`}
          style={
            customOpen
              ? { borderColor: tint.hex, backgroundColor: tint.hex }
              : undefined
          }
        >
          redeem custom
        </button>

        {customOpen && (
          <div className="mt-3">
            <div className="flex items-center gap-2 rounded-xl border-2 px-3 py-2" style={{ borderColor: tint.hex }}>
              <input
  type="number"
  inputMode="numeric"
  min={0}
  max={effectiveMaxRedeemable}
  placeholder="0"
  value={customAmount}
  onFocus={() => {
    setSelectedPreset("custom");
    setCustomOpen(true);
  }}
  onChange={(e) => {
    const value = e.target.value;
    setCustomAmount(value);

    const amount = Math.max(
      0,
      Math.min(effectiveMaxRedeemable, Number(value) || 0)
    );

    onSelectRedeemAmount(amount);
  }}
  className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none"
/>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">{t("points_suffix")}</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {t("custom_max_hint", { amount: `${effectiveMaxRedeemable.toLocaleString()} ${t("points_suffix")}` })}
            </p>
          </div>
        )}
      </div>

      {/* ── Redemption summary ── */}
      <div className="mx-4 sm:mx-6 mb-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2.5">
         Summary Title
        </p>

        <div className="space-y-1.5 text-sm">

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300 font-medium">summary remaining</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {Math.round(animatedHeaderPoints).toLocaleString()} {t("points_suffix")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300 font-medium">summary discount</span>
            <span className="font-bold tabular-nums" style={{ color: tint.hex }}>
              {format(animatedDiscount)}
            </span>
          </div>
        </div>

        {pointRate !== 1 && (
          <p className="mt-2.5 text-[11px] text-gray-400 dark:text-gray-500">
            summary rate hint , $1 : { pointRate } point 
          </p>
        )}
      </div>

      {/* Applied feedback */}
      {walletApplied && (
        <div
          className="mx-4 sm:mx-6 mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: tint.light, color: tint.hex }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="tabular-nums">
            applied — saved {format(animatedDiscount)}
          </span>
        </div>
      )}
    </section>
  );
}