"use client";

/**
 * Personal Information — Profile Photo, Legal Name, Preferred Name, Email,
 * Phone, Date of Birth, Gender, Address, Emergency Contact, Bio. Every row
 * is Label / current value / Edit button — clicking Edit opens a side
 * drawer (never inline editing), per spec.
 *
 * No update-profile endpoint exists in services/*.js (same conclusion the
 * existing AccountSettingsGrid.jsx already documents), so Save shows the
 * same honest "not connected yet" toast rather than faking persistence.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconUser,
  IconUserCircle,
  IconMail,
  IconPhone,
  IconCalendar,
  IconGenderBigender,
  IconHome,
  IconMailbox,
  IconPhoneCall,
  IconNotes,
  IconCircleCheck,
  IconShieldCheck,
  IconCamera,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import {
  SettingsCard,
  CardHeading,
  RowItem,
  EditDrawer,
  FormField,
  TextInput,
  SelectInput,
  TextArea,
  PrimaryButton,
  StatusPill,
} from "../ui";

const FIELDS = [
  { key: "legalName", icon: IconUser, type: "text" },
  { key: "preferredName", icon: IconUserCircle, type: "text" },
  { key: "email", icon: IconMail, type: "email", verifiable: true },
  { key: "phone", icon: IconPhone, type: "tel", verifiable: true },
  { key: "dob", icon: IconCalendar, type: "date" },
  { key: "gender", icon: IconGenderBigender, type: "select" },
  { key: "bio", icon: IconNotes, type: "textarea" },
];

/* Grouped at the bottom of the card, mirroring the reference layout:
   Identity verification (status only, no edit) followed by Residential
   address / Postal address / Emergency contact — each showing an "Add"
   link when empty and "Edit" once a value exists. */
const ADDRESS_FIELDS = [
  { key: "residentialAddress", icon: IconHome, type: "text" },
  { key: "postalAddress", icon: IconMailbox, type: "text" },
  { key: "emergencyContact", icon: IconPhoneCall, type: "tel" },
];

function initialsOf(name) {
  if (!name) return "VB";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase() || "VB";
}

export default function PersonalInfo({ user }) {
  const t = useTranslations("accountSettings.personalInfo");
  const tCommon = useTranslations("accountSettings.common");
  const tGender = useTranslations("accountSettings.personalInfo.genderOptions");
  const toast = useToast();

  const [values, setValues] = useState({
    legalName: user?.name || "",
    preferredName: user?.preferredName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: "",
    gender: "",
    bio: "",
    residentialAddress: "",
    postalAddress: "",
    emergencyContact: "",
  });
  const [draft, setDraft] = useState("");
  const [editingKey, setEditingKey] = useState(null);

  const isVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);

  const openEdit = (key) => {
    setDraft(values[key] || "");
    setEditingKey(key);
  };

  const dirty = editingKey ? draft !== (values[editingKey] || "") : false;

  const save = () => {
    // Honest no-op — no confirmed update-profile endpoint exists yet.
    toast.info(tCommon("comingSoon"));
    setEditingKey(null);
  };

  const field = FIELDS.find((f) => f.key === editingKey) || ADDRESS_FIELDS.find((f) => f.key === editingKey);

  return (
    <SettingsCard>
      <CardHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<IconUser size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />}
      />

      {/* Profile photo — its own row at the top, not part of the generic list */}
      <div className="flex items-center justify-between gap-4 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-[19px] font-bold border-2 border-white dark:border-gray-800 shadow-sm"
                style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
              >
                {initialsOf(user?.name)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <IconCamera size={12} className="text-gray-500" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">{t("photoLabel")}</p>
            <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-50 truncate mt-1">{user?.name || "—"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toast.info(tCommon("comingSoon"))}
          className="shrink-0 px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
        >
          {t("changePhoto")}
        </button>
      </div>

      {FIELDS.map((f) => (
        <RowItem
          key={f.key}
          icon={<f.icon size={16} stroke={1.75} />}
          label={t(f.key)}
          value={f.key === "gender" && values[f.key] ? tGender(values[f.key]) : values[f.key]}
          placeholder={t("notAdded")}
          editLabel={tCommon("edit")}
          onEdit={() => openEdit(f.key)}
          badge={
            f.verifiable ? (
              <StatusPill
                tone={isVerified ? "green" : "amber"}
                label={isVerified ? tCommon("verified") : tCommon("unverified")}
              />
            ) : null
          }
        />
      ))}

      {/* Identity verification — status only, no edit affordance */}
      <RowItem
        icon={<IconShieldCheck size={16} stroke={1.75} />}
        label={t("identityVerification")}
        value={isVerified ? tCommon("verified") : tCommon("notVerified")}
      />

      {ADDRESS_FIELDS.map((f, i) => (
        <RowItem
          key={f.key}
          last={i === ADDRESS_FIELDS.length - 1}
          icon={<f.icon size={16} stroke={1.75} />}
          label={t(f.key)}
          value={values[f.key]}
          placeholder={t("notAdded")}
          editLabel={values[f.key] ? tCommon("edit") : tCommon("add")}
          onEdit={() => openEdit(f.key)}
        />
      ))}

      <EditDrawer open={!!editingKey} onClose={() => setEditingKey(null)} title={field ? t(field.key) : ""} dirty={dirty}>
        {field && (
          <div className="space-y-4">
            <FormField label={t(field.key)}>
              {field.type === "textarea" ? (
                <TextArea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("notAdded")} />
              ) : field.type === "select" ? (
                <SelectInput value={draft} onChange={(e) => setDraft(e.target.value)}>
                  <option value="">{t("notAdded")}</option>
                  <option value="female">{tGender("female")}</option>
                  <option value="male">{tGender("male")}</option>
                  <option value="other">{tGender("other")}</option>
                  <option value="prefer_not_to_say">{tGender("prefer_not_to_say")}</option>
                </SelectInput>
              ) : (
                <TextInput type={field.type} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("notAdded")} />
              )}
            </FormField>
            <div className="flex items-center gap-2.5 pt-2">
              <PrimaryButton onClick={save}>{tCommon("save")}</PrimaryButton>
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="px-4 py-2.5 text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {tCommon("cancel")}
              </button>
            </div>
            {field.verifiable && (
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5 pt-1">
                <IconCircleCheck size={13} />
                {t("verificationNote")}
              </p>
            )}
          </div>
        )}
      </EditDrawer>
    </SettingsCard>
  );
}
