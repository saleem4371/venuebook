"use client";

/**
 * Login & Security — Password (or "Managed by Google" for social-login
 * accounts, mirroring PasswordCard.jsx's existing provider-detection
 * logic), Two-Factor Auth, Email/Phone verification, Active Sessions,
 * Recent Login Activity, Recovery Email, Connected Login Providers.
 *
 * "Active Sessions" and "Connected Login Providers" deep-link into the
 * Devices and Connected Accounts sections respectively via `onNavigate`
 * rather than duplicating that content here.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconLock,
  IconMail,
  IconPhone,
  IconDeviceLaptop,
  IconHistory,
  IconMailFast,
  IconPlugConnected,
  IconBrandGoogle,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_LOGIN_ACTIVITY } from "../../data/mockAccountData";
import {
  SettingsCard,
  CardHeading,
  RowItem,
  ToggleRow,
  StatusPill,
  EditDrawer,
  FormField,
  TextInput,
  PrimaryButton,
} from "../ui";

export default function LoginSecurity({ user, onNavigate }) {
  const t = useTranslations("accountSettings.loginSecurity");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const provider = user?.loginProvider || user?.login_provider || user?.provider || user?.authProvider;
  const isGoogleManaged = provider === "google";

  const isEmailVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);
  const isPhoneVerified = Boolean(user?.phone_verified);

  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });

  const savePassword = (e) => {
    e.preventDefault();
    toast.info(tCommon("comingSoon"));
    setPasswordOpen(false);
  };

  const saveRecovery = () => {
    toast.info(tCommon("comingSoon"));
    setRecoveryOpen(false);
  };

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconLock size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      {isGoogleManaged ? (
        <RowItem
          icon={<IconBrandGoogle size={16} stroke={1.75} />}
          label={t("password")}
          value={t("managedByGoogle")}
          badge={<StatusPill tone="violet" label="Google" />}
        />
      ) : (
        <RowItem
          icon={<IconLock size={16} stroke={1.75} />}
          label={t("password")}
          value="••••••••••"
          editLabel={tCommon("edit")}
          onEdit={() => setPasswordOpen(true)}
        />
      )}

      <ToggleRow
        label={t("twoFactor")}
        description={t("twoFactorDesc")}
        checked={twoFactor}
        onChange={(v) => {
          setTwoFactor(v);
          toast.info(tCommon("comingSoon"));
        }}
      />

      <RowItem
        icon={<IconMail size={16} stroke={1.75} />}
        label={t("emailVerification")}
        value={user?.email}
        badge={<StatusPill tone={isEmailVerified ? "green" : "amber"} label={isEmailVerified ? tCommon("verified") : tCommon("unverified")} />}
        editLabel={!isEmailVerified ? t("verifyNow") : undefined}
        onEdit={!isEmailVerified ? () => toast.info(tCommon("comingSoon")) : undefined}
      />

      <RowItem
        icon={<IconPhone size={16} stroke={1.75} />}
        label={t("phoneVerification")}
        value={user?.phone}
        placeholder={t("noPhone")}
        badge={<StatusPill tone={isPhoneVerified ? "green" : "amber"} label={isPhoneVerified ? tCommon("verified") : tCommon("unverified")} />}
        editLabel={!isPhoneVerified ? t("verifyNow") : undefined}
        onEdit={!isPhoneVerified ? () => toast.info(tCommon("comingSoon")) : undefined}
      />

      <RowItem
        icon={<IconDeviceLaptop size={16} stroke={1.75} />}
        label={t("activeSessions")}
        value={t("activeSessionsValue")}
        editLabel={tCommon("viewAll")}
        onEdit={() => onNavigate?.("devices")}
      />

      <RowItem
        icon={<IconMailFast size={16} stroke={1.75} />}
        label={t("recoveryEmail")}
        value={recoveryEmail}
        placeholder={t("notAdded")}
        editLabel={tCommon("edit")}
        onEdit={() => setRecoveryOpen(true)}
      />

      <RowItem
        icon={<IconPlugConnected size={16} stroke={1.75} />}
        label={t("connectedProviders")}
        value={t("connectedProvidersValue")}
        editLabel={tCommon("viewAll")}
        onEdit={() => onNavigate?.("connected")}
        last
      />

      {/* Recent login activity — read-only log, no edit affordance */}
      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 mb-3">
          <IconHistory size={15} stroke={1.75} />
          {t("recentActivity")}
        </p>
        <ul className="space-y-2.5">
          {MOCK_LOGIN_ACTIVITY.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 text-[12.5px]">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{row.event}</p>
                <p className="text-gray-400 dark:text-gray-500 text-[11px] truncate">{row.device} · {row.location}</p>
              </div>
              <span className="shrink-0 text-gray-400 dark:text-gray-500 text-[11px]">{row.when}</span>
            </li>
          ))}
        </ul>
      </div>

      <EditDrawer open={passwordOpen} onClose={() => setPasswordOpen(false)} title={t("password")}>
        <form onSubmit={savePassword} className="space-y-4">
          <FormField label={t("currentPassword")}>
            <TextInput type="password" value={fields.current} onChange={(e) => setFields((f) => ({ ...f, current: e.target.value }))} />
          </FormField>
          <FormField label={t("newPassword")}>
            <TextInput type="password" value={fields.next} onChange={(e) => setFields((f) => ({ ...f, next: e.target.value }))} />
          </FormField>
          <FormField label={t("confirmPassword")}>
            <TextInput type="password" value={fields.confirm} onChange={(e) => setFields((f) => ({ ...f, confirm: e.target.value }))} />
          </FormField>
          <PrimaryButton type="submit">{tCommon("save")}</PrimaryButton>
        </form>
      </EditDrawer>

      <EditDrawer open={recoveryOpen} onClose={() => setRecoveryOpen(false)} title={t("recoveryEmail")}>
        <div className="space-y-4">
          <FormField label={t("recoveryEmail")}>
            <TextInput type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder={t("notAdded")} />
          </FormField>
          <PrimaryButton onClick={saveRecovery}>{tCommon("save")}</PrimaryButton>
        </div>
      </EditDrawer>
    </SettingsCard>
  );
}
