"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/OffersPanel.jsx
 *
 * Left column — compact offer chips stacked one below the other (not a
 * horizontal scroller), since the left column is a narrow fixed-width
 * rail rather than a wide ribbon. Same MOCK_OFFERS data as
 * OffersSection.jsx (mobile fallback), just laid out as a slim row per
 * offer (icon + title + tag) so all three fit without feeling oversized.
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
        compact
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/30">
            <Sparkles size={12} className="text-violet-600" />
          </span>
        }
      />
      <div className="flex flex-col gap-2">
        {MOCK_OFFERS.map((o) => (
          <motion.div
            key={o.id}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="relative overflow-hidden rounded-xl px-3 py-2.5 text-white flex items-center gap-2.5"
            style={{ background: `linear-gradient(135deg, ${o.colorFrom}, ${o.colorTo})` }}
          >
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/15 blur-lg" />
            <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 shrink-0">
              <Tag size={12} />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-[11.5px] font-bold leading-snug truncate">{o.title}</p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur text-[8.5px] font-mono font-semibold">
                {o.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}
