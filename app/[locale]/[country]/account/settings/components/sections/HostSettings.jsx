"use client";

/**
 * Host Settings — only rendered for vendor accounts (page.jsx already
 * gates the nav item + route on isListed from useAuth()). Business
 * Information, Verification/KYC, Tax Details, Payout, Host Preferences.
 * Real vendor-listing settings/KYC endpoints live under a completely
 * different feature area (services/listing.service.js, vendor/*) with
 * their own flows — this card is an account-level summary/shortcut, not a
 * replacement for those, so it stays read-only + "not connected yet" here
 * rather than risk sending a mismatched payload to a vendor-only API.
 */

import { useTranslations } from "next-intl";
import { IconBuildingStore, IconShieldCheck, IconFileCertificate, IconReceipt2, IconWallet, IconAdjustmentsHorizontal } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_HOST_BUSINESS } from "../../data/mockAccountData";
import { SettingsCard, CardHeading, RowItem, StatusPill } from "../ui";

export default function HostSettings() {
  const t = useTranslations("accountSettings.hostSettings");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();
  const comingSoon = () => toast.info(tCommon("comingSoon"));

  const kycVerified = MOCK_HOST_BUSINESS.kycStatus === "verified";

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconBuildingStore size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <RowItem
        icon={<IconBuildingStore size={16} stroke={1.75} />}
        label={t("businessInfo")}
        value={MOCK_HOST_BUSINESS.legalName}
        editLabel={tCommon("edit")}
        onEdit={comingSoon}
      />
      <RowItem
        icon={<IconShieldCheck size={16} stroke={1.75} />}
        label={t("verification")}
        value={kycVerified ? t("verified") : t("pending")}
        badge={<StatusPill tone={kycVerified ? "green" : "amber"} label={kycVerified ? tCommon("verified") : t("pending")} />}
        editLabel={tCommon("viewAll")}
        onEdit={comingSoon}
      />
      <RowItem
        icon={<IconFileCertificate size={16} stroke={1.75} />}
        label={t("kyc")}
        value={t("kycValue")}
        editLabel={tCommon("edit")}
        onEdit={comingSoon}
      />
      <RowItem
        icon={<IconReceipt2 size={16} stroke={1.75} />}
        label={t("taxDetails")}
        value={MOCK_HOST_BUSINESS.gstin}
        editLabel={tCommon("edit")}
        onEdit={comingSoon}
      />
      <RowItem
        icon={<IconWallet size={16} stroke={1.75} />}
        label={t("payout")}
        value={MOCK_HOST_BUSINESS.payoutAccount}
        editLabel={tCommon("edit")}
        onEdit={comingSoon}
      />
      <RowItem
        icon={<IconAdjustmentsHorizontal size={16} stroke={1.75} />}
        label={t("hostPreferences")}
        value={t("hostPreferencesValue")}
        editLabel={tCommon("edit")}
        onEdit={comingSoon}
        last
      />
    </SettingsCard>
  );
}
