"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/OffersPanel.jsx
 *
 * Left column (default) — compact offer chips stacked one below the other
 * (not a horizontal scroller), since the left column is a narrow
 * fixed-width rail rather than a wide ribbon. Same MOCK_OFFERS data as
 * OffersSection.jsx (mobile fallback), just laid out as a slim row per
 * offer (icon + title + tag) so all three fit without feeling oversized.
 *
 * `expanded` — used when page.jsx's Bookings↔Offers layout swap puts this
 * in the CENTER column instead (see page.jsx's header comment, and
 * BookingsPanel.jsx's `compact` prop for the widget going the other way):
 * a bigger card grid filling the center column's full height, since it's
 * now the dashboard's main content rather than a side rail.
 */

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Tag, Sparkles } from "lucide-react";

import { SectionCard, SectionHeading } from "../shared/ui";
import { MOCK_OFFERS } from "../../data/mockProfileData";

export default function OffersPanel({ expanded = false, flat = false }) {
  const t = useTranslations("profile.offers");

  if (expanded) {
    return (
      <SectionCard flat={flat} className="flex flex-col min-h-0 flex-1" padded={false}>
        <div className="p-4 pb-0">
          <SectionHeading
            title={t("title")}
            subtitle={t("subtitle")}
            icon={
              <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-violet-50 dark:bg-violet-900/30">
                <Sparkles size={18} className="text-violet-600" />
              </span>
            }
          />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_OFFERS.map((o) => (
              <motion.div
                key={o.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden rounded-2xl p-5 text-white flex flex-col justify-between min-h-[150px]"
                style={{ background: `linear-gradient(135deg, ${o.colorFrom}, ${o.colorTo})` }}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15 blur-xl" />
                <span className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 shrink-0">
                  <Tag size={20} />
                </span>
                <div className="relative mt-4">
                  <p className="text-[18px] font-bold leading-snug">{o.title}</p>
                  <span className="inline-block mt-2.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur text-[11px] font-mono font-semibold">
                    {o.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard flat={flat}>
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
