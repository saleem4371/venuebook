"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";
import { generateAwards } from "../utils/compareHelpers";

const AWARD_EMOJI = {
  bestValue: "🏆",
  topRated: "👑",
  bestForFamilies: "💚",
  mostAmenities: "✨",
};

export default function RecommendationCards({ properties, experience, locale, country }) {
  const t = useTranslations("compare.recommendations");
  const { format } = useCurrency();
  const awards = generateAwards(properties);

  if (!awards.length) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
      <h2 className="text-[20px] font-semibold text-gray-900 dark:text-gray-50 mb-1">{t("heading")}</h2>
      <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 max-w-lg">{t("subheading")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {awards.map((award) => {
          const reasonKey = `${award.type}.${experience === "farmstay" ? "reasonFarmstay" : "reasonVenue"}`;
          const reasonValues =
            award.type === "bestValue" ? { price: format(award.metrics.price), size: award.metrics.size } :
            award.type === "topRated" ? { rating: Number(award.metrics.rating).toFixed(1) } :
            award.type === "bestForFamilies" ? { size: award.metrics.size } :
            { count: award.metrics.count };

          return (
            <div
              key={award.type}
              className="rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl leading-none">{AWARD_EMOJI[award.type]}</span>
                <span className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t(`${award.type}.title`)}
                </span>
              </div>
              <Link
                href={`/${locale || "en"}/${country || "in"}/search/${award.property.category}/${award.property.childVenueId}`}
                target="_blank"
                className="text-[16px] font-semibold text-gray-900 dark:text-gray-50 hover:text-[var(--cat-accent)] transition"
              >
                {award.property.venueName}
              </Link>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {t(reasonKey, reasonValues)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
