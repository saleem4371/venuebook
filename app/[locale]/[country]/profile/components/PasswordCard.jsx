"use client";

/**
 * /app/[locale]/[country]/profile/components/PasswordCard.jsx
 *
 * Only shown when the account can actually change a password.
 * `user.loginProvider` (or login_provider / provider / authProvider) isn't
 * used anywhere else in this app today, so its presence can't be confirmed.
 * DEFAULT-SHOW when the field is missing: hiding "Change Password" for
 * every user just because we can't detect the field would silently break
 * the feature for 100% of email-login users, which is worse than
 * occasionally showing it to a social-login user (who simply won't have a
 * password to change and can ignore the card). This default is called out
 * explicitly here rather than buried in a ternary.
 *
 * The only password-related backend call in this app (resetPasswordApi) is
 * the OTP-based forgot-password flow (email + otp + new password) used by
 * LoginModal — not an in-session "current password → new password" change.
 * Wiring this form to that endpoint would silently send the wrong payload,
 * so it shows the same honest "not connected yet" toast as the other
 * unwired settings cards instead.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";

import { useToast } from "@/components/ToastProvider";
import { SectionCard, SectionHeading, PrimaryButton } from "./shared/ui";

export default function PasswordCard({ user }) {
  const t = useTranslations("profile.password");
  const tSettings = useTranslations("profile.settings");
  const toast = useToast();

  const provider = user?.loginProvider || user?.login_provider || user?.provider || user?.authProvider;
  const canChangePassword = !provider || provider === "email";

  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });

  if (!canChangePassword) return null;

  const submit = (e) => {
    e.preventDefault();
    toast.info(tSettings("comingSoon"));
  };

  return (
    <SectionCard className="max-w-2xl">
      <SectionHeading
        title={t("title")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30">
            <Lock size={16} className="text-violet-600" />
          </span>
        }
      />
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordField
          label={t("currentPassword")}
          value={fields.current}
          onChange={(v) => setFields((f) => ({ ...f, current: v }))}
        />
        <div />
        <PasswordField
          label={t("newPassword")}
          value={fields.next}
          onChange={(v) => setFields((f) => ({ ...f, next: v }))}
        />
        <PasswordField
          label={t("confirmPassword")}
          value={fields.confirm}
          onChange={(v) => setFields((f) => ({ ...f, confirm: v }))}
        />
        <div className="sm:col-span-2">
          <PrimaryButton type="submit">{t("cta")}</PrimaryButton>
        </div>
      </form>
    </SectionCard>
  );
}

function PasswordField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11.5px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-[13px] text-gray-900 dark:text-gray-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-colors"
      />
    </div>
  );
}
