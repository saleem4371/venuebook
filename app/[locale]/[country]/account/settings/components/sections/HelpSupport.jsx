"use client";

/**
 * Help & Support — no dedicated support-ticket/FAQ endpoint exists in this
 * codebase, so this is an honest static FAQ + a "Contact support" action
 * that surfaces the same "not connected yet" toast as the rest of the
 * module's unwired actions.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconHelpCircle, IconMessageCircle, IconChevronDown } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { SettingsCard, CardHeading, PrimaryButton } from "../ui";

const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4"];

export default function HelpSupport() {
  const t = useTranslations("accountSettings.help");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconHelpCircle size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-4 flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{t("contactSupport")}</p>
          <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{t("contactSupportDesc")}</p>
        </div>
        <PrimaryButton onClick={() => toast.info(tCommon("comingSoon"))} className="shrink-0">
          <IconMessageCircle size={14} />
          {t("contactSupport")}
        </PrimaryButton>
      </div>

      <p className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 mb-3">{t("faqTitle")}</p>
      <div className="space-y-2">
        {FAQ_KEYS.map((key) => {
          const isOpen = openFaq === key;
          return (
            <div key={key} className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq((v) => (v === key ? null : key))}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-[13px] font-medium text-gray-800 dark:text-gray-100">{t(`${key}Q`)}</span>
                <IconChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <p className="px-4 pb-3.5 text-[12.5px] text-gray-500 dark:text-gray-400 leading-relaxed">{t(`${key}A`)}</p>
              )}
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
}
