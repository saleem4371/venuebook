"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Gift, ChevronRight, X, History as HistoryIcon } from "lucide-react";

import { SectionCard, SectionHeading, ProgressBar, PrimaryButton } from "./shared/ui";

const REWARD_STEP = 500;
const COUNT_UP_DURATION_MS = 800;
const VISIBLE_HISTORY_COUNT = 3;

function useCountUp(target, durationMs = COUNT_UP_DURATION_MS) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const safeTarget = Number.isFinite(target) ? target : 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(safeTarget * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

const formatHistoryDate = (isoDate) => {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
};

function HistoryRow({ h, index = 0, animated = true }) {
  const Wrapper = animated ? motion.li : "li";
  const motionProps = animated
    ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, delay: 0.05 * index } }
    : {};

  return (
    <Wrapper {...motionProps} className="flex items-center justify-between gap-3 text-[12px]">
      <div className="min-w-0">
        <p className="text-gray-700 dark:text-gray-300 truncate">{h.label}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{h.date}</p>
      </div>
      <span className={`shrink-0 font-semibold ${h.delta >= 0 ? "text-green-600" : "text-red-500"}`}>
        {h.delta >= 0 ? "+" : ""}
        {h.delta}
      </span>
    </Wrapper>
  );
}

function HistoryModal({ t, rows, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/30">
              <HistoryIcon size={15} className="text-green-600" />
            </span>
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{t("history")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {rows.length === 0 ? (
            <p className="text-[12px] text-gray-400 dark:text-gray-500">{t("empty")}</p>
          ) : (
            <ul className="space-y-3">
              {rows.map((h, i) => (
                <HistoryRow key={h.id} h={h} index={i} animated={i < 12} />
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FarmRewards({ flat = false, rewards, isLoading = false }) {
  const t = useTranslations("profile.farmRewards");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const rewad = rewards?.rewads;
  // Only trust this as a real, active member with real points — no
  // walletPoints mock fallback anymore. Missing/partial data is treated
  // as a genuine zero-state, not silently swapped for a demo number.
  const hasRealData = Boolean(rewad && typeof rewad.available_points === "number");
  const availablePoints = hasRealData ? rewad.available_points : 0;

  const nextThreshold = (Math.floor(availablePoints / REWARD_STEP) + 1) * REWARD_STEP;
  const progressPercent = Math.round(((availablePoints % REWARD_STEP) / REWARD_STEP) * 100);
  const canRedeem = availablePoints >= REWARD_STEP;

  const animatedPoints = useCountUp(availablePoints);

  // Real transaction ledger only — no MOCK_POINTS_HISTORY fallback.
  // No real history (or no real member yet) means an honestly empty
  // list, which the "No reward activity yet" message below already
  // handles.
  const historyRows = useMemo(() => {
    const real = rewards?.history;
    if (!Array.isArray(real) || real.length === 0) return [];

    return real
      .slice()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map((h, i) => ({
        id: h.id ?? `${h.booking_id ?? "txn"}-${h.transaction_type}-${i}`,
        label: h.remarks || (h.booking_code ? `Booking #${h.booking_code}` : t("history")),
        date: formatHistoryDate(h.created_at),
        delta: h.transaction_type === "redeem" ? -Math.abs(h.points || 0) : Math.abs(h.points || 0),
      }));
  }, [rewards?.history, t]);

  const visibleRows = historyRows.slice(0, VISIBLE_HISTORY_COUNT);
  const hasMore = historyRows.length > VISIBLE_HISTORY_COUNT;

  if (isLoading) {
    return (
      <SectionCard flat={flat}>
        <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </SectionCard>
    );
  }

  return (
    <SectionCard flat={flat}>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/30">
            <Sprout size={16} className="text-green-600" />
          </span>
        }
      />

      {!hasRealData ? (
        // Honest empty state — no member record yet, no fake balance,
        // no fake progress bar, no fake history.
        <div className="py-2">
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
  Your membership journey starts with your first booking. Make bookings to
  unlock higher tiers and enjoy more rewards and benefits.
</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{t("currentPoints")}</p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-[24px] font-bold text-gray-900 dark:text-gray-50 leading-tight mt-0.5"
            >
              {animatedPoints.toLocaleString()}
            </motion.p>

            <div className="mt-3">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <ProgressBar percent={progressPercent} colorClass="bg-green-600" animate />
              </motion.div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                {t("nextReward", { points: nextThreshold.toLocaleString() })}
              </p>
            </div>

            <PrimaryButton
              disabled={!canRedeem}
              className={`mt-3 !bg-green-600 hover:!bg-green-700 ${!canRedeem ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <Gift size={13} />
              {t("redeem")}
            </PrimaryButton>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t("history")}
              </p>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setShowAllHistory(true)}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                >
                  View all
                  <ChevronRight size={12} />
                </button>
              )}
            </div>

            {visibleRows.length === 0 ? (
              <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("noActivityYet")}
              </p>
            ) : (
              <ul className="space-y-2">
                {visibleRows.map((h, i) => (
                  <HistoryRow key={h.id} h={h} index={i} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAllHistory && (
          <HistoryModal t={t} rows={historyRows} onClose={() => setShowAllHistory(false)} />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}