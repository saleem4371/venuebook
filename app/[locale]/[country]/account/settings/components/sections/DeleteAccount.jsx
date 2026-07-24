"use client";

/**
 * Delete Account — standalone nav destination. Reuses the existing
 * DangerZone.jsx component wholesale (already has the confirm-to-delete
 * modal, the "not connected yet" toast, and the profile.danger i18n
 * strings) rather than rebuilding the same destructive-action UI a second
 * time inside this module.
 */

import { useTranslations } from "next-intl";
import { IconAlertTriangle } from "@tabler/icons-react";

import DangerZone from "@/app/[locale]/[country]/profile/components/DangerZone";
import { SettingsCard, CardHeading } from "../ui";

export default function DeleteAccount() {
  const t = useTranslations("accountSettings.deleteAccount");

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconAlertTriangle size={18} className="text-red-600" stroke={1.75} />} />
      <DangerZone />
    </SettingsCard>
  );
}
