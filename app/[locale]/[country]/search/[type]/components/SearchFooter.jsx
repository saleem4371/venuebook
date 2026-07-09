"use client";

/**
 * SearchFooter — minimal footer for the search results page.
 *
 * The search list page hides the global <Footer /> (see ClientLayout.jsx,
 * `isSearchListPage`) because a full footer competes with the map/listings
 * layout. This renders just the bottom legal line of the site footer —
 * copyright + legal links + localization pill + socials — scoped to the
 * listings column, below the last venue card / pagination.
 *
 * Reuses the same atoms as PremiumFooter (LegalStrip, LocalizationPill,
 * SocialRow) and the same region/currency hooks — no duplicated markup,
 * no changes to the stable region/currency/i18n foundation.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  LegalStrip,
  LocalizationPill,
  SocialRow,
} from "@/app/[locale]/[country]/home/components/PremiumFooter";
import RegionLanguageModal from "@/app/[locale]/[country]/home/components/RegionLanguageModal";
import { useRegion } from "@/hooks/useRegion";
import { useCurrency } from "@/hooks/useCurrency";

export default function SearchFooter() {
  const t = useTranslations("footer");
  const { region } = useRegion();
  const { currency } = useCurrency();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer
        className="mt-6 border-t border-gray-100 dark:border-gray-800"
        aria-labelledby="footer-search-label"
      >
        <h2 id="footer-search-label" className="sr-only">
          {t("sr_label")}
        </h2>

        <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <LegalStrip t={t} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <LocalizationPill
              t={t}
              region={region}
              currency={currency}
              onOpenModal={() => setModalOpen(true)}
            />
            <SocialRow t={t} />
          </div>
        </div>
      </footer>

      <RegionLanguageModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
