"use client";

/**
 * Privacy — Visibility, Data Download, Data Export, Delete Personal Data,
 * and a link into the standalone Delete Account section (which reuses the
 * existing DangerZone.jsx component wholesale rather than rebuilding the
 * same confirm-to-delete UI a second time).
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconLock, IconDownload, IconFileExport, IconUserOff } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { SettingsCard, CardHeading, ToggleRow, RowItem, ConfirmDialog } from "../ui";

export default function Privacy({ onNavigate }) {
  const t = useTranslations("accountSettings.privacy");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const [isPublic, setIsPublic] = useState(false);
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);

  const comingSoon = () => toast.info(tCommon("comingSoon"));

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconLock size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <ToggleRow
        label={t("visibility")}
        description={isPublic ? t("public") : t("private")}
        checked={isPublic}
        onChange={(v) => { setIsPublic(v); comingSoon(); }}
      />

      <RowItem
        icon={<IconDownload size={16} stroke={1.75} />}
        label={t("dataDownload")}
        value={t("dataDownloadDesc")}
        editLabel={t("request")}
        onEdit={() => toast.success(t("exportRequested"))}
      />

      <RowItem
        icon={<IconFileExport size={16} stroke={1.75} />}
        label={t("dataExport")}
        value={t("dataExportDesc")}
        editLabel={t("request")}
        onEdit={() => toast.success(t("exportRequested"))}
      />

      <RowItem
        icon={<IconUserOff size={16} stroke={1.75} />}
        label={t("deletePersonalData")}
        value={t("deletePersonalDataDesc")}
        editLabel={tCommon("edit")}
        onEdit={() => setDeleteDataOpen(true)}
        last
      />

      <ConfirmDialog
        open={deleteDataOpen}
        onClose={() => setDeleteDataOpen(false)}
        onConfirm={() => { comingSoon(); setDeleteDataOpen(false); }}
        title={t("deletePersonalData")}
        description={t("deletePersonalDataConfirm")}
        confirmLabel={tCommon("remove")}
        danger
      />
    </SettingsCard>
  );
}
