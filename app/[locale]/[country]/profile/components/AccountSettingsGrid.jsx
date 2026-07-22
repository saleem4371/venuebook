"use client";

/**
 * /app/[locale]/[country]/profile/components/AccountSettingsGrid.jsx
 *
 * Settings grid replacing the old left sidebar. Language / Region / Currency
 * cards are REAL — they embed the app's existing, protected LanguageSwitcher
 * / CurrencySwitcher components and open the existing RegionLanguageModal,
 * none of which are modified here, only consumed (per the "Region system /
 * next-intl / Currency system are stable foundation" rule).
 *
 * Personal Information / Email Preferences / Notification Settings /
 * Privacy / Security have no backend endpoint anywhere in this codebase
 * (confirmed: no update-profile route exists in services/*.js — the only
 * candidate, settings.service.js, is vendor-listing-schema settings, a
 * different resource entirely, so it is deliberately NOT reused here to
 * avoid silently corrupting vendor data with a mismatched payload). They
 * render as real, functional cards with an honest "not connected yet"
 * toast rather than a fake success message that would mislead the user
 * into thinking a change was persisted.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  BellRing,
  ShieldCheck,
  Lock,
  Languages,
  Globe2,
  CircleDollarSign,
  ChevronRight,
  Save,
} from "lucide-react";

import { useToast } from "@/components/ToastProvider";
import { useRegion } from "@/hooks/useRegion";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocale } from "@/hooks/useLocale";
import { LANGUAGE_META } from "@/config/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import RegionLanguageModal from "@/app/[locale]/[country]/home/components/RegionLanguageModal";

import { SectionCard, SectionHeading, PrimaryButton } from "./shared/ui";

export default function AccountSettingsGrid({ user, showHeader = true }) {
  const t = useTranslations("profile.settings");
  const toast = useToast();
  const { regionConfig } = useRegion();
  const { currency } = useCurrency();
  const { locale } = useLocale();

  const [openCard, setOpenCard] = useState(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const comingSoon = () => toast.info(t("comingSoon"));

  const languageLabel = LANGUAGE_META[locale]?.native || "English";

  return (
    <SectionCard>
      {/* Skipped when embedded in the desktop Settings drawer — that
          SlideOverPanel already shows its own "Account" title bar, so this
          internal heading was rendering the exact same title/subtitle a
          second time right underneath it. Still shown on the mobile
          full-detail stack, where this IS the page's only "Account"
          heading. */}
      {showHeader && (
        <SectionHeading title={t("title")} subtitle={t("subtitle")} icon={<User size={16} className="text-violet-600" />} />
      )}

      {/*
        Deliberately capped at 2 columns (no lg:grid-cols-4). This grid also
        renders inside the fixed-dashboard's settings SlideOverPanel, which
        is a ~560px-wide drawer regardless of the viewport being desktop —
        Tailwind's lg: breakpoint responds to the VIEWPORT, not the drawer's
        actual rendered width, so a 4-column track there was squeezing every
        label down to a couple of truncated characters. 2 columns fits both
        the drawer and the mobile full-width stack cleanly.
      */}
      <div id="personal-information" className="scroll-mt-24 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PERSONAL INFORMATION — the only card with real inline content */}
        <SettingCard
          className="sm:col-span-2"
          Icon={User}
          label={t("personalInfo")}
          expanded={openCard === "personal"}
          onClick={() => setOpenCard((v) => (v === "personal" ? null : "personal"))}
        >
          <div className="space-y-3 mt-4">
            <TextField label={t("nameLabel")} value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <TextField label={t("emailLabel")} value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <TextField label={t("phoneLabel")} value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <PrimaryButton onClick={comingSoon} className="mt-1">
              <Save size={13} />
              {t("save")}
            </PrimaryButton>
          </div>
        </SettingCard>

        <SettingCard Icon={Mail} label={t("emailPreferences")} onClick={comingSoon} />
        <SettingCard Icon={BellRing} label={t("notificationSettings")} onClick={comingSoon} />
        <SettingCard Icon={ShieldCheck} label={t("privacy")} onClick={comingSoon} />
        <SettingCard Icon={Lock} label={t("security")} onClick={comingSoon} />

        {/* REAL — embeds the existing LanguageSwitcher dropdown */}
        <SettingCard Icon={Languages} label={t("language")} value={languageLabel} expanded={openCard === "language"} onClick={() => setOpenCard((v) => (v === "language" ? null : "language"))}>
          <div className="mt-3">
            <LanguageSwitcher />
          </div>
        </SettingCard>

        {/* REAL — opens the existing RegionLanguageModal */}
        <SettingCard Icon={Globe2} label={t("region")} value={regionConfig?.name} onClick={() => setRegionModalOpen(true)} />

        {/* REAL — embeds the existing CurrencySwitcher dropdown */}
        <SettingCard Icon={CircleDollarSign} label={t("currency")} value={currency} expanded={openCard === "currency"} onClick={() => setOpenCard((v) => (v === "currency" ? null : "currency"))}>
          <div className="mt-3">
            <CurrencySwitcher />
          </div>
        </SettingCard>
      </div>

      <RegionLanguageModal open={regionModalOpen} onClose={() => setRegionModalOpen(false)} />
    </SectionCard>
  );
}

function SettingCard({ Icon, label, value, expanded, onClick, className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-200 p-3.5 ${className}`}
    >
      <button type="button" onClick={onClick} className="w-full flex items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <Icon size={14} className="text-violet-600" />
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold text-gray-900 dark:text-gray-50 leading-snug">{label}</span>
            {value && <span className="block text-[10.5px] text-gray-500 dark:text-gray-400 truncate">{value}</span>}
          </span>
        </span>
        <ChevronRight
          size={15}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </button>
      {expanded && children}
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11.5px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-colors"
      />
    </div>
  );
}
