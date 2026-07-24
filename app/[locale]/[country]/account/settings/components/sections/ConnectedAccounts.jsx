"use client";

/**
 * Connected Accounts — Google, Facebook, Apple, Phone, each with a real
 * connected/not-connected status pill. Disconnecting a currently-connected
 * provider goes through the shared ConfirmDialog (it's the closest thing to
 * a destructive action in this section); connecting a new one is a single
 * honest "not connected yet" toast, same as everywhere else this module has
 * no backing endpoint.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconBrandGoogle, IconBrandFacebook, IconBrandApple, IconPhone } from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_CONNECTED_ACCOUNTS } from "../../data/mockAccountData";
import { SettingsCard, CardHeading, StatusPill, ConfirmDialog } from "../ui";

const PROVIDER_ICON = { google: IconBrandGoogle, facebook: IconBrandFacebook, apple: IconBrandApple, phone: IconPhone };

export default function ConnectedAccounts() {
  const t = useTranslations("accountSettings.connectedAccounts");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const [accounts, setAccounts] = useState(MOCK_CONNECTED_ACCOUNTS);
  const [target, setTarget] = useState(null);

  const disconnect = () => {
    setAccounts((list) => list.map((a) => (a.id === target.id ? { ...a, connected: false, value: null } : a)));
    toast.info(tCommon("comingSoon"));
    setTarget(null);
  };

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconBrandGoogle size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <div className="space-y-2.5">
        {accounts.map((a) => {
          const Icon = PROVIDER_ICON[a.id] || IconPhone;
          return (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3.5 hover:border-violet-200 dark:hover:border-violet-800/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Icon size={18} stroke={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50">{t(a.id)}</p>
                  <p className="text-[11.5px] text-gray-500 dark:text-gray-400 truncate">
                    {a.connected ? a.value : t("notConnected")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <StatusPill tone={a.connected ? "green" : "gray"} label={a.connected ? tCommon("connected") : tCommon("notConnected")} />
                <button
                  type="button"
                  onClick={() => (a.connected ? setTarget(a) : toast.info(tCommon("comingSoon")))}
                  className="px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[11.5px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  {a.connected ? tCommon("disconnect") : tCommon("connect")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={disconnect}
        title={t("disconnectTitle")}
        description={target ? t("disconnectConfirm", { provider: t(target.id) }) : ""}
        confirmLabel={tCommon("disconnect")}
        danger
      />
    </SettingsCard>
  );
}
