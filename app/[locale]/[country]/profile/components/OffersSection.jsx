"use client";

/**
 * /app/[locale]/[country]/profile/components/OffersSection.jsx
 *
 * Mock — no offers/wallet/coupons/gift-card API exists anywhere in this
 * codebase yet. Deal copy (title/subtitle/tag) is dynamic content, not UI
 * chrome, so — consistent with how BookingsSection treats property names —
 * it isn't run through next-intl; only the section labels are.
 */

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Tag, Wallet, Ticket, Gift, Sparkles } from "lucide-react";

import { SectionCard, SectionHeading, EmptyState } from "./shared/ui";
import { MOCK_OFFERS } from "../data/mockProfileData";

export default function OffersSection() {
  const t = useTranslations("profile.offers");

  const wallets = [
    { key: "creditWallet", Icon: Wallet, color: "#7C3AED" },
    { key: "coupons", Icon: Ticket, color: "#2563EB" },
    { key: "giftCards", Icon: Gift, color: "#DB2777" },
  ];

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Sparkles size={16} className="text-violet-600" />
          </span>
        }
      />

      {MOCK_OFFERS.length === 0 ? (
        <EmptyState
          icon={<Tag size={22} className="text-violet-600" />}
          title={t("empty.title")}
          subtitle={t("empty.subtitle")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {MOCK_OFFERS.map((o) => (
            <motion.div
              key={o.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-2xl p-3.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
              style={{ background: `linear-gradient(135deg, ${o.colorFrom}, ${o.colorTo})` }}
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/15 blur-xl" />
              <Tag size={15} className="relative mb-2 opacity-90" />
              <p className="relative text-[13.5px] font-bold leading-snug">{o.title}</p>
              <p className="relative text-[11px] text-white/85 mt-0.5">{o.subtitle}</p>
              <span className="relative inline-block mt-2 px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur text-[10px] font-mono font-semibold tracking-wide">
                {o.tag}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {wallets.map(({ key, Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-shadow"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}1A` }}
            >
              <Icon size={14} color={color} />
            </span>
            <span className="text-[10.5px] font-semibold text-gray-700 dark:text-gray-300 text-center px-1">
              {t(key)}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
