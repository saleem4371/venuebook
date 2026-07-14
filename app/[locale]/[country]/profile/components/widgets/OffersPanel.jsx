"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/OffersPanel.jsx
 *
 * Center column, bottom ribbon — compact horizontal offer chips, mirroring
 * the "EXCLUSIVE · PLATINUM ONLY" ribbon at the bottom of the reference
 * mockup. Same MOCK_OFFERS data as OffersSection.jsx (mobile fallback),
 * just laid out as a scrollable row instead of a grid to fit one short
 * strip at the bottom of the fixed layout.
 */

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Tag, Sparkles } from "lucide-react";

import { SectionCard, SectionHeading } from "../shared/ui";
import { MOCK_OFFERS } from "../../data/mockProfileData";

export default function OffersPanel() {
  const t = useTranslations("profile.offers");

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Sparkles size={14} className="text-violet-600" />
          </span>
        }
      />
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
        {MOCK_OFFERS.map((o) => (
          <motion.div
            key={o.id}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="relative shrink-0 w-[190px] overflow-hidden rounded-2xl p-3 text-white"
            style={{ background: `linear-gradient(135deg, ${o.colorFrom}, ${o.colorTo})` }}
          >
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-white/15 blur-lg" />
            <Tag size={13} className="relative mb-1.5 opacity-90" />
            <p className="relative text-[12px] font-bold leading-snug truncate">{o.title}</p>
            <span className="relative inline-block mt-1.5 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur text-[9px] font-mono font-semibold">
              {o.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}
