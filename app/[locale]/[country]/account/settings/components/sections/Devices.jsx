"use client";

/**
 * Devices & Sessions — Current Device (active), Other Devices (last seen,
 * location, logout). Mock session list (data/mockAccountData.js) — no
 * session-management endpoint is confirmed, so Logout Device shows the
 * honest "not connected yet" toast after confirmation rather than actually
 * revoking anything.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconDeviceLaptop, IconDeviceMobile, IconMapPin, IconLogout, IconCircleCheck } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_DEVICES } from "../../data/mockAccountData";
import { SettingsCard, CardHeading, StatusPill, ConfirmDialog, SecondaryButton } from "../ui";

export default function Devices() {
  const t = useTranslations("accountSettings.devices");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const [target, setTarget] = useState(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  const confirmLogout = () => {
    toast.info(tCommon("comingSoon"));
    setTarget(null);
  };

  const confirmLogoutAll = () => {
    toast.info(tCommon("comingSoon"));
    setLogoutAllOpen(false);
  };

  return (
    <SettingsCard>
      <CardHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<IconDeviceLaptop size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />}
        action={
          <SecondaryButton onClick={() => setLogoutAllOpen(true)} className="!px-3.5 !py-1.5 !text-[11.5px]">
            {t("logoutAll")}
          </SecondaryButton>
        }
      />

      {/* Current device */}
      <div className="rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-violet-50/40 dark:bg-violet-900/10 p-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center">
              <IconDeviceLaptop size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{MOCK_DEVICES.current.device}</p>
              <p className="text-[11.5px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <IconMapPin size={12} />
                {MOCK_DEVICES.current.location}
              </p>
            </div>
          </div>
          <StatusPill tone="green" label={t("active")} />
        </div>
        <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1.5 mt-2.5">
          <IconCircleCheck size={13} />
          {t("currentDevice")}
        </p>
      </div>

      {/* Other devices */}
      <p className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 mb-3">{t("otherDevices")}</p>
      <div className="space-y-2.5">
        {MOCK_DEVICES.others.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3.5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center text-gray-500 dark:text-gray-400">
                {d.device.toLowerCase().includes("iphone") || d.device.toLowerCase().includes("android") ? (
                  <IconDeviceMobile size={16} stroke={1.75} />
                ) : (
                  <IconDeviceLaptop size={16} stroke={1.75} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50 truncate">{d.device}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{d.location} · {t("lastSeen")} {d.lastSeen}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTarget(d)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[11.5px] font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-colors"
            >
              <IconLogout size={13} />
              {t("logoutDevice")}
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={confirmLogout}
        title={t("logoutDevice")}
        description={target ? t("logoutConfirm", { device: target.device }) : ""}
        confirmLabel={t("logoutDevice")}
        danger
      />

      <ConfirmDialog
        open={logoutAllOpen}
        onClose={() => setLogoutAllOpen(false)}
        onConfirm={confirmLogoutAll}
        title={t("logoutAll")}
        description={t("logoutAllConfirm")}
        confirmLabel={t("logoutAll")}
        danger
      />
    </SettingsCard>
  );
}
