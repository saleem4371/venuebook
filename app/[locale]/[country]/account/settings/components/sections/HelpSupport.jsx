"use client";

/**
 * Help & Support — simplified to two actions: go to FAQ, or raise a
 * support ticket. No dedicated FAQ/ticket page or endpoint exists yet in
 * this codebase, so both surface the same honest "not connected yet" toast
 * as the rest of the module's unwired actions, rather than linking to a
 * page that doesn't exist.
 */

import { useTranslations } from "next-intl";
import { IconHelpCircle, IconMessageCircle, IconChevronRight } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { SettingsCard, CardHeading } from "../ui";

export default function HelpSupport() {
  const t = useTranslations("accountSettings.help");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const comingSoon = () => toast.info(tCommon("comingSoon"));

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconHelpCircle size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={comingSoon}
          className="w-full flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
              <IconHelpCircle size={17} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{t("goToFaq")}</span>
              <span className="block text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{t("goToFaqDesc")}</span>
            </span>
          </span>
          <IconChevronRight size={16} className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={comingSoon}
          className="w-full flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
              <IconMessageCircle size={17} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{t("raiseTicket")}</span>
              <span className="block text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">{t("contactSupportDesc")}</span>
            </span>
          </span>
          <IconChevronRight size={16} className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180" />
        </button>
      </div>
    </SettingsCard>
  );
}
