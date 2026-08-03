"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { AlarmClock, ImageOff } from "lucide-react";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

function msRemaining(targetIso) {
  return Math.max(0, new Date(targetIso).getTime() - Date.now());
}

/**
 * Robust countdown hook.
 * - Ticks every second using Date.now() (not accumulated drift).
 * - Re-syncs immediately when the tab regains focus/visibility, since
 *   browsers throttle/pause setInterval in background tabs — without this,
 *   switching tabs and back shows a stale number for a moment (feels
 *   "frozen").
 * - Uses the target's time value (number) as the effect dependency
 *   instead of the raw prop string, so it won't spuriously reset if the
 *   parent re-renders and passes a new-but-equal date string.
 */
function useCountdown(targetIso) {
  const targetMs = targetIso ? new Date(targetIso).getTime() : null;
  const [remaining, setRemaining] = useState(() => (targetMs ? Math.max(0, targetMs - Date.now()) : 0));
  const targetMsRef = useRef(targetMs);
  targetMsRef.current = targetMs;

  useEffect(() => {
    if (!targetMs) {
      setRemaining(0);
      return undefined;
    }

    const tick = () => setRemaining(Math.max(0, targetMsRef.current - Date.now()));

    tick(); // sync immediately on mount / target change
    const id = setInterval(tick, 1000);

    // Force a re-sync when the tab becomes visible again — background
    // tabs throttle setInterval, so without this the ring/digits can sit
    // stale for seconds after switching back.
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [targetMs]);

  return remaining;
}

function getUrgencyTier(remainingMs) {
  const minutes = remainingMs / 60000;
  if (minutes <= 10) return "critical";
  if (minutes <= 60) return "tight";
  return "normal";
}

const TIER_STYLES = {
  normal: {
    border: "border-amber-200/70 dark:border-amber-500/20",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600",
    numColor: "text-amber-600",
    ring: "",
    stroke: "#d97706",
    track: "#fde8c9",
  },
  tight: {
    border: "border-orange-300/80 dark:border-orange-500/30",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-600",
    numColor: "text-orange-600",
    ring: "",
    stroke: "#ea580c",
    track: "#fed7aa",
  },
  critical: {
    border: "border-red-300 dark:border-red-500/40",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-600",
    numColor: "text-red-600",
    ring: "shadow-[0_0_0_1px_rgba(239,68,68,0.15)]",
    stroke: "#dc2626",
    track: "#fecaca",
  },
};

function TimeUnit({ value, label, color }) {
  return (
    <div className="flex items-baseline">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 6, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`text-[16px] font-bold tabular-nums ${color}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 ms-0.5 me-1.5">{label}</span>
    </div>
  );
}

function TimerRing({ percentRemaining, stroke, track, tier, size = 52 }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentRemaining);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={tier === "critical" ? { opacity: [1, 0.4, 1] } : {}}
        transition={tier === "critical" ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        <AlarmClock size={16} style={{ color: stroke }} />
      </motion.div>
    </div>
  );
}

export default function ReserveHoldCard({ reservationHold, holdWindowMs = 24 * 60 * 60 * 1000 }) {
  const t = useTranslations("profile.reserveHold");
  const remaining = useCountdown(reservationHold?.reservation_end_date);

  if (!reservationHold || remaining <= 0) return null;

  const venueName = reservationHold.child_venue_name || reservationHold.venue_name_snapshot;
  const imageUrl = reservationHold.coverImage ? `${IMAGE_BASE_URL}/${reservationHold.coverImage}` : null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");

  const tier = getUrgencyTier(remaining);
  const s = TIER_STYLES[tier];
  const percentRemaining = Math.min(1, remaining / holdWindowMs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, scale: tier === "critical" ? [1, 1.012, 1] : 1 }}
      transition={
        tier === "critical"
          ? {
              scale: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
            }
          : { duration: 0.35, ease: "easeOut" }
      }
      className={`relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border ${s.border} ${s.ring} shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-3.5`}
    >
      <div className="flex items-center gap-3">
        <TimerRing percentRemaining={percentRemaining} stroke={s.stroke} track={s.track} tier={tier} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-50 truncate">{t("title")}</p>
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0 ms-auto" />
            ) : (
              <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 ms-auto">
                <ImageOff size={10} className="text-gray-400" />
              </span>
            )}
          </div>

          {/* <div className="flex items-baseline flex-wrap tabular-nums">
            {days > 0 && <TimeUnit value={days} label={t("d")} color={s.numColor} />}
            <TimeUnit value={pad(hours)} label={t("h")} color={s.numColor} />
            <TimeUnit value={pad(minutes)} label={t("m")} color={s.numColor} />
            {days === 0 && <TimeUnit value={pad(seconds)} label={t("s")} color={s.numColor} />}
          </div> */}
          <div className="flex items-baseline flex-wrap tabular-nums">
            {days > 0 && <TimeUnit value={days} label={t("d")} color={s.numColor} />}
            <TimeUnit value={pad(hours)} label={t("h")} color={s.numColor} />
            <TimeUnit value={pad(minutes)} label={t("m")} color={s.numColor} />
            <TimeUnit value={pad(seconds)} label={t("s")} color={s.numColor} />
          </div>
        </div>
      </div>

      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-2 truncate">
        {t("subtitle", { property: venueName })}
      </p>
    </motion.div>
  );
}