"use client";

/**
 * Addresses — Home, Office, Other, a Map Preview, Default Address.
 * The map preview is a static, honest placeholder (not a live Google Maps
 * embed) since wiring a real map per saved address is outside "only
 * improve architecture/UI/UX" — it visually communicates the idea without
 * pretending to be a live map.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconMapPin, IconHome, IconBuildingSkyscraper, IconMapPinFilled, IconPlus, IconStar } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_ADDRESSES } from "../../data/mockAccountData";
import { SettingsCard, CardHeading, StatusPill, EmptyRow, PrimaryButton } from "../ui";

const TYPE_ICON = { home: IconHome, office: IconBuildingSkyscraper, other: IconMapPinFilled };

export default function Addresses() {
  const t = useTranslations("accountSettings.addresses");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const [addresses] = useState(MOCK_ADDRESSES);
  const comingSoon = () => toast.info(tCommon("comingSoon"));

  return (
    <SettingsCard>
      <CardHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<IconMapPin size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />}
        action={
          <button type="button" onClick={comingSoon} className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300">
            <IconPlus size={14} stroke={2} />
            {t("addAddress")}
          </button>
        }
      />

      {addresses.length === 0 ? (
        <EmptyRow
          icon={<IconMapPin size={18} className="text-gray-400" />}
          title={t("noAddresses")}
          cta={<PrimaryButton onClick={comingSoon}>{t("addAddress")}</PrimaryButton>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const Icon = TYPE_ICON[addr.type] || IconMapPinFilled;
            return (
              <div key={addr.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-violet-200 dark:hover:border-violet-800/60 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-900 dark:text-gray-50">
                    <span className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
                    </span>
                    {t(addr.type)}
                  </span>
                  {addr.isDefault && <StatusPill tone="violet" label={t("defaultAddress")} />}
                </div>
                <p className="text-[12.5px] text-gray-600 dark:text-gray-300 leading-snug">
                  {addr.line1}, {addr.city}, {addr.state} — {addr.pincode}
                </p>

                {/* Map preview placeholder — honest static illustration, no live embed */}
                <div className="mt-3 h-20 rounded-xl bg-[repeating-linear-gradient(45deg,theme(colors.gray.50)_0px,theme(colors.gray.50)_10px,theme(colors.gray.100)_10px,theme(colors.gray.100)_20px)] dark:bg-gray-800/50 flex items-center justify-center">
                  <IconMapPinFilled size={20} className="text-violet-400" />
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button onClick={comingSoon} className="flex-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[11.5px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    {tCommon("edit")}
                  </button>
                  {!addr.isDefault && (
                    <button onClick={comingSoon} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[11.5px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <IconStar size={12} />
                      {t("setDefault")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SettingsCard>
  );
}
