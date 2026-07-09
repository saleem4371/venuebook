"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Scale, Heart, ArrowRight } from "lucide-react";
import FloatingDecorCards from "./shared/FloatingDecorCards";

export default function EmptyState({ locale, country }) {
  const t = useTranslations("compare.empty");

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4 py-36 md:py-20">
      {/* Floating decorative property cards — illustrative mock listings
          styled to match the real search-result card (photo, name,
          location, rating, price), not empty grey skeleton bars. Shared
          with CategorySwitchNotice so every "nothing to compare yet"
          surface looks the same, not just this one. */}
      <FloatingDecorCards />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* Illustration */}
        <div className="relative mb-8">
          <div
            className="w-28 h-28 rounded-[28px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(168,85,247,0.06) 100%)" }}
          >
            <Scale size={44} strokeWidth={1.5} className="text-violet-500" />
          </div>
          <div
            className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-950 flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          >
            <Heart size={18} className="text-pink-500 fill-pink-500" />
          </div>
        </div>

        <h2 className="text-[22px] md:text-[26px] font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
          {t("title")}
        </h2>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-[320px]">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 w-full sm:w-auto">
          <Link
            href={`/${locale || "en"}/${country || "in"}/search/venues`}
            className="inline-flex items-center justify-center gap-2 text-white text-[14px] font-semibold px-6 py-4 rounded-2xl transition active:scale-[0.98] hover:opacity-95"
            style={{ background: "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)", boxShadow: "0 8px 20px rgba(124,58,237,0.30)" }}
          >
            {t("primaryCta")}
            <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>

          <Link
            href={`/${locale || "en"}/${country || "in"}/collections`}
            className="inline-flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 text-[14px] font-semibold px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-[0.98]"
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
