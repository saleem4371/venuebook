"use client";

/**
 * Personal Information — Profile Photo, Legal Name, Email, Phone
 * verification, Date of Birth, Gender, Bio, Identity verification,
 * Residential address. Every editable row is Label / current value / Edit
 * button — clicking Edit opens a side drawer (never inline editing), per
 * spec. Phone verification (status only, no edit drawer — "Verify now"
 * triggers the same honest not-connected-yet toast as everything else)
 * lives here rather than in Login & Security, right next to the number it
 * verifies.
 *
 * No update-profile endpoint exists in services/*.js (same conclusion the
 * existing AccountSettingsGrid.jsx already documents), so Save shows the
 * same honest "not connected yet" toast rather than faking persistence.
 *
 * Profile photo is the one exception — useAuth().updateAvatar() genuinely
 * works client-side (see context/AuthContext.jsx), persisting per-account
 * to localStorage since there's no backend field for it yet, so "Change
 * photo" here actually updates the avatar everywhere it's shown (navbar,
 * Profile, this page) instead of another comingSoon toast.
 */

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconGenderBigender,
  IconHome,
  IconNotes,
  IconCircleCheck,
  IconShieldCheck,
  IconCamera,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { useRegion } from "@/hooks/useRegion";
import { getAvatarColor, getInitials } from "@/lib/avatar";
import {
  SettingsCard,
  CardHeading,
  RowItem,
  EditModal,
  FormField,
  TextInput,
  SelectInput,
  TextArea,
  PrimaryButton,
  StatusPill,
} from "../ui";

const FIELDS = [
  { key: "legalName", icon: IconUser, type: "text" },
  { key: "email", icon: IconMail, type: "email", verifiable: true },
  { key: "dob", icon: IconCalendar, type: "date" },
  { key: "gender", icon: IconGenderBigender, type: "select" },
  { key: "bio", icon: IconNotes, type: "textarea" },
];

/* Grouped at the bottom of the card: Identity verification (status only, no
   edit — its method is region-aware, see IDENTITY_METHOD_BY_REGION below)
   followed by Residential address, which doubles as the organisation/
   billing address per spec. Preferred name, Postal address, and Emergency
   contact are intentionally not collected here anymore. */
const ADDRESS_FIELDS = [{ key: "residentialAddress", icon: IconHome, type: "text" }];

/* Identity verification method differs by region — Aadhaar for India,
   UAE Pass for the UAE. Falls back to India's method for any other region
   until a new one is configured (per lib/region.js's REGIONS map). */
const IDENTITY_METHOD_BY_REGION = {
  IN: "identityVerificationAadhaar",
  AE: "identityVerificationUaePass",
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB — generous for a profile photo, cheap to guard against accidental huge uploads bloating localStorage

export default function PersonalInfo({ user }) {
  const t = useTranslations("accountSettings.personalInfo");
  const tCommon = useTranslations("accountSettings.common");
  const tGender = useTranslations("accountSettings.personalInfo.genderOptions");
  const toast = useToast();
  const { updateAvatar } = useAuth();
  const { region } = useRegion();
  const fileInputRef = useRef(null);

  const identityMethodKey = IDENTITY_METHOD_BY_REGION[region] || IDENTITY_METHOD_BY_REGION.IN;

  const [values, setValues] = useState({
    legalName: user?.name || "",
    email: user?.email || "",
    dob: "",
    gender: "",
    bio: "",
    residentialAddress: "",
  });
  const [draft, setDraft] = useState("");
  const [editingKey, setEditingKey] = useState(null);

  const isVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);
  const isPhoneVerified = Boolean(user?.phone_verified);

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("photoInvalidType"));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error(t("photoTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateAvatar(reader.result); // data URL — shows up everywhere immediately (navbar, Profile, this row)
      toast.success(t("photoUpdated"));
    };
    reader.onerror = () => toast.error(t("photoUploadFailed"));
    reader.readAsDataURL(file);
  };

  return (
    <SettingsCard>
      <CardHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<IconUser size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />}
      />

      {/* Profile photo — its own row at the top, not part of the generic list.
          Real upload now (see handlePhotoSelect above) — the one row in this
          whole page that isn't a comingSoon no-op, since updateAvatar()
          genuinely persists client-side. Same color-when-no-photo logic
          (lib/avatar.js) as the navbar/Profile, so this never shows a
          different fallback color for the same account. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />
      <div className="flex items-center justify-between gap-4 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-[19px] font-bold border-2 border-white dark:border-gray-800 shadow-sm"
                style={{ backgroundColor: getAvatarColor(user?.name) }}
              >
                {getInitials(user?.name, "VB")}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={t("changePhoto")}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <IconCamera size={12} className="text-gray-500" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">{t("photoLabel")}</p>
            <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-50 truncate mt-1">{user?.name || "—"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
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

      {/* Phone verification — moved here from Login & Security, right next
          to the number it verifies. Status only, no edit drawer; "Verify
          now" surfaces the same honest not-connected-yet toast as the
          rest of this module's unwired actions. */}
      <RowItem
        icon={<IconPhone size={16} stroke={1.75} />}
        label={t("phoneVerification")}
        value={user?.phone}
        placeholder={t("noPhone")}
        badge={
          <StatusPill
            tone={isPhoneVerified ? "green" : "amber"}
            label={isPhoneVerified ? tCommon("verified") : tCommon("unverified")}
          />
        }
        editLabel={!isPhoneVerified ? t("verifyNow") : undefined}
        onEdit={!isPhoneVerified ? () => toast.info(tCommon("comingSoon")) : undefined}
      />

      {/* Identity verification — status only, no edit affordance. The
          method itself is region-aware: Aadhaar for India, UAE Pass for
          the UAE (see IDENTITY_METHOD_BY_REGION above), read from the
          existing useRegion() — stable foundation, not modified here. */}
      <RowItem
        icon={<IconShieldCheck size={16} stroke={1.75} />}
        label={t("identityVerification")}
        hint={t(identityMethodKey)}
        value={isVerified ? tCommon("verified") : tCommon("notVerified")}
      />

      {ADDRESS_FIELDS.map((f, i) => (
        <RowItem
          key={f.key}
          last={i === ADDRESS_FIELDS.length - 1}
          icon={<f.icon size={16} stroke={1.75} />}
          label={t(f.key)}
          hint={t("residentialAddressHint")}
          value={values[f.key]}
          placeholder={t("notAdded")}
          editLabel={values[f.key] ? tCommon("edit") : tCommon("add")}
          onEdit={() => openEdit(f.key)}
        />
      ))}

      <EditModal open={!!editingKey} onClose={() => setEditingKey(null)} title={field ? t(field.key) : ""} dirty={dirty}>
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
      </EditModal>
    </SettingsCard>
  );
}
