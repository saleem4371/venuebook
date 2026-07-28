"use client";

/**
 * Login & Security — Password (or "Managed by Google" for social-login
 * accounts, mirroring PasswordCard.jsx's existing provider-detection
 * logic), Two-Factor Auth, Active Sessions, Recovery Email, Connected
 * Login Providers.
 *
 * Email and phone verification aren't collected here anymore — phone
 * verification now lives in Personal Information, right next to the phone
 * number it verifies, instead of split across two sections. Recent login
 * activity lives in the Devices & Sessions section (it's a device/session
 * log, not a login-method setting), so it isn't duplicated here either.
 *
 * "Active Sessions" and "Connected Login Providers" deep-link into the
 * Devices and Connected Accounts sections respectively via `onNavigate`
 * rather than duplicating that content here.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconLock,
  IconDeviceLaptop,
  IconMailFast,
  IconPlugConnected,
  IconBrandGoogle,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import {
  SettingsCard,
  CardHeading,
  RowItem,
  ToggleRow,
  StatusPill,
  EditModal,
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

      <EditModal open={passwordOpen} onClose={() => setPasswordOpen(false)} title={t("password")}>
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
      </EditModal>

      <EditModal open={recoveryOpen} onClose={() => setRecoveryOpen(false)} title={t("recoveryEmail")}>
        <div className="space-y-4">
          <FormField label={t("recoveryEmail")}>
            <TextInput type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder={t("notAdded")} />
          </FormField>
          <PrimaryButton onClick={saveRecovery}>{tCommon("save")}</PrimaryButton>
        </div>
      </EditModal>
    </SettingsCard>
  );
}
