"use client";

/**
 * Preferences — Language, Region, Currency, Theme, Accessibility, Distance
 * Unit, Date Format.
 *
 * Language / Region / Currency are REAL — they read from the app's actual
 * useRegion/useCurrency/useLocale hooks (stable foundation, not modified)
 * and open the existing RegionLanguageModal to change them, exactly the
 * same real system AccountSettingsGrid.jsx already uses. Theme is REAL too:
 * Navbar.jsx keeps its own private `useTheme` hook (not exported, so it
 * can't be imported) that toggles `document.documentElement.classList` and
 * persists to `localStorage["theme"]` — this duplicates that exact minimal
 * logic locally rather than modifying Navbar.jsx, so both toggles stay in
 * sync via the same localStorage key and DOM class.
 *
 * Accessibility / Distance Unit / Date Format have no app-wide consumer
 * yet, so they're honest local-only preferences (comingSoon toast) — same
 * pattern as every other unwired settings card in this codebase.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IconAdjustments, IconLanguage, IconGlobe, IconCoin, IconRuler2, IconCalendar } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { useRegion } from "@/hooks/useRegion";
import { useCurrency } from "@/hooks/useCurrency";
import { useLocale } from "@/hooks/useLocale";
import { LANGUAGE_META } from "@/config/i18n";
import RegionLanguageModal from "@/app/[locale]/[country]/home/components/RegionLanguageModal";
import { SettingsCard, CardHeading, RowItem, ToggleRow } from "../ui";

/* Same minimal logic as Navbar.jsx's private useTheme — duplicated (not
   imported, it isn't exported) so this toggle stays a real, working
   control instead of a fake one. Reads the identical localStorage key
   ("theme") and the identical `dark` class on <html>, so toggling here or
   from anywhere else in the app always agrees. */
function useLocalTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try { localStorage.setItem("theme", next ? "dark" : "light"); } catch (_) {}
      return next;
    });
  };

  return { isDark, toggleTheme, mounted };
}

export default function Preferences() {
  const t = useTranslations("accountSettings.preferences");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const { regionConfig } = useRegion();
  const { currency } = useCurrency();
  const { locale } = useLocale();
  const { isDark, toggleTheme, mounted } = useLocalTheme();

  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [dateFormat, setDateFormat] = useState("dd_mm_yyyy");

  const languageLabel = LANGUAGE_META[locale]?.native || "English";

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconAdjustments size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      {/* REAL — opens the existing RegionLanguageModal, language tab */}
      <RowItem
        icon={<IconLanguage size={16} stroke={1.75} />}
        label={t("language")}
        value={languageLabel}
        editLabel={tCommon("change")}
        onEdit={() => setRegionModalOpen(true)}
      />

      {/* REAL — same modal, region tab */}
      <RowItem
        icon={<IconGlobe size={16} stroke={1.75} />}
        label={t("region")}
        value={regionConfig?.name}
        editLabel={tCommon("change")}
        onEdit={() => setRegionModalOpen(true)}
      />

      {/* REAL — same modal, currency tab */}
      <RowItem
        icon={<IconCoin size={16} stroke={1.75} />}
        label={t("currency")}
        value={currency}
        editLabel={tCommon("change")}
        onEdit={() => setRegionModalOpen(true)}
      />

      {/* REAL — actually toggles the app's dark mode */}
      <ToggleRow
        label={t("theme")}
        description={mounted ? (isDark ? t("themeDark") : t("themeLight")) : ""}
        checked={isDark}
        onChange={() => {
          toggleTheme();
          toast.success(t("themeUpdated"));
        }}
      />

      <ToggleRow
        label={t("accessibility")}
        description={t("reduceMotionDesc")}
        checked={reduceMotion}
        onChange={(v) => { setReduceMotion(v); toast.info(tCommon("comingSoon")); }}
      />

      <RowItem
        icon={<IconRuler2 size={16} stroke={1.75} />}
        label={t("distanceUnit")}
        value={distanceUnit === "km" ? t("km") : t("miles")}
        editLabel={tCommon("change")}
        onEdit={() => { setDistanceUnit((u) => (u === "km" ? "miles" : "km")); toast.info(tCommon("comingSoon")); }}
      />

      <RowItem
        icon={<IconCalendar size={16} stroke={1.75} />}
        label={t("dateFormat")}
        value={dateFormat === "dd_mm_yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
        editLabel={tCommon("change")}
        onEdit={() => { setDateFormat((f) => (f === "dd_mm_yyyy" ? "mm_dd_yyyy" : "dd_mm_yyyy")); toast.info(tCommon("comingSoon")); }}
        last
      />

      <RegionLanguageModal open={regionModalOpen} onClose={() => setRegionModalOpen(false)} />
    </SettingsCard>
  );
}
