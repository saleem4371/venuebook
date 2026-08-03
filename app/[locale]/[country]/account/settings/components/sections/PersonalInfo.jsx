"use client";

/**
 * Personal Information — Profile Photo, Legal Name, Email, Phone
 * verification, Date of Birth, Gender, Bio, Identity verification,
 * Residential address. Every editable row is Label / current value / Edit
 * button — clicking Edit opens a side drawer (never inline editing), per
 * spec. Phone lives inside FIELDS now (see below) rather than as its own
 * standalone block, so it gets the exact same Add → Verify treatment as
 * Email instead of a slightly different one-off.
 *
 * No update-profile endpoint exists in services/*.js (same conclusion the
 * existing AccountSettingsGrid.jsx already documents), so Save simulates
 * a round trip (loading state on the button) and optimistically reflects
 * the new value locally — honest that nothing is persisted server-side
 * yet (still a comingSoon toast), while giving the Add → Verify flow
 * something real to react to in the UI.
 *
 * Verifiable fields (email, phone) follow one rule everywhere:
 *   - no value yet        → "Add"        (opens the edit drawer)
 *   - value, not verified → "Verify now" (comingSoon toast, no drawer —
 *                                          editing a verifiable value once
 *                                          set isn't offered here)
 *   - value, verified     → no action, just the Verified badge
 *
 * Profile photo is the one exception — useAuth().updateAvatar() genuinely
 * works client-side (see context/AuthContext.jsx), persisting per-account
 * to localStorage since there's no backend field for it yet, so "Change
 * photo" here actually updates the avatar everywhere it's shown (navbar,
 * Profile, this page) instead of another comingSoon toast.
 */

import { useRef, useState , useEffect } from "react";
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
  IconLoader2,
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
  { key: "name", icon: IconUser, type: "text" },
  { key: "email", icon: IconMail, type: "email", verifiable: true },
  { key: "phone", icon: IconPhone, type: "tel", verifiable: true },
  { key: "dob", icon: IconCalendar, type: "date" },
  { key: "gender", icon: IconGenderBigender, type: "select" },
  { key: "bio", icon: IconNotes, type: "textarea" },
];

/* Grouped at the bottom of the card: Identity verification (status only, no
   edit — its method is region-aware, see IDENTITY_METHOD_BY_REGION below)
   followed by Residential address, which doubles as the organisation/
   billing address per spec. Preferred name, Postal address, and Emergency
   contact are intentionally not collected here anymore. */
const ADDRESS_FIELDS = [{ key: "address", icon: IconHome, type: "text" }];

/* Identity verification method differs by region — Aadhaar for India,
   UAE Pass for the UAE. Falls back to India's method for any other region
   until a new one is configured (per lib/region.js's REGIONS map). */
const IDENTITY_METHOD_BY_REGION = {
  IN: "identityVerificationAadhaar",
  AE: "identityVerificationUaePass",
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB — generous for a profile photo, cheap to guard against accidental huge uploads bloating localStorage
const SAVE_SIMULATED_DELAY_MS = 900; // gives the loading spinner something real to show instead of resolving instantly

export default function PersonalInfo({ user, profiles,updateProfile }) {
  const t = useTranslations("accountSettings.personalInfo");
  const tCommon = useTranslations("accountSettings.common");
  const tGender = useTranslations("accountSettings.personalInfo.genderOptions");
  const toast = useToast();
  const { updateAvatar } = useAuth();
  const { region } = useRegion();
  const fileInputRef = useRef(null);

  const identityMethodKey = IDENTITY_METHOD_BY_REGION[region] || IDENTITY_METHOD_BY_REGION.IN;

const [values, setValues] = useState({
  name: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  bio: "",
  address: "",
});

useEffect(() => {
  if (!profiles) return;

  setValues({
    name: profiles.name || "",
    email: profiles.email || "",
    phone: profiles.phone || "",
    dob: profiles.dob || "",
    gender: profiles.gender || "",
    bio: profiles.bio || "",
    address: profiles.address || "",
  });
}, [profiles]);

  const [draft, setDraft] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);
  const isPhoneVerified = Boolean(user?.phone_verified);

  // Which "verified" flag applies to a given verifiable field.
  const verifiedFor = (key) => (key === "email" ? isVerified : key === "phone" ? isPhoneVerified : false);

  const openEdit = (key) => {
    setDraft(values[key] || "");
    setEditingKey(key);
  };

  const dirty = editingKey ? draft !== (values[editingKey] || "") : false;

  const save = async () => {
  if (!editingKey) return;

  setIsSaving(true);

  try {
    const payload = {
      [editingKey]: draft,
    };

    const res = await updateProfile(payload);

    if (res?.data?.success) {
      setValues((prev) => ({
        ...prev,
        [editingKey]: draft,
      }));

      toast.success(res.data.message || "Updated successfully");
      setEditingKey(null);
    } else {
      toast.error(res?.data?.message || "Failed to update");
    }
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Something went wrong");
  } finally {
    setIsSaving(false);
  }
};

  const closeEdit = () => {
    if (isSaving) return; // don't let Cancel/backdrop close mid-save
    setEditingKey(null);
  };

  const field = FIELDS.find((f) => f.key === editingKey) || ADDRESS_FIELDS.find((f) => f.key === editingKey);
const handlePhotoSelect = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error(t("photoInvalidType"));
    return;
  }

  if (file.size > MAX_PHOTO_BYTES) {
    toast.error(t("photoTooLarge"));
    return;
  }

  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await updateProfile(formData);

    if (res?.data?.success) {
      updateAvatar(res.data.data.logo); // backend image URL
      toast.success(t("photoUpdated"));
    } else {
      toast.error(res?.data?.message || "Upload failed");
    }
  } catch (err) {
    console.error(err);
    toast.error(t("photoUploadFailed"));
  }
};
  return (
    <SettingsCard>
      <CardHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<IconUser size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />}
      />
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

      {FIELDS.map((f) => {
        const val = values[f.key];
        const hasValue = Boolean(val);
        let editLabel;
        let onEdit;
        let badge = null;

        if (f.verifiable) {
          const verified = verifiedFor(f.key);
          badge = (
            <StatusPill
              tone={verified ? "green" : "amber"}
              label={verified ? tCommon("verified") : tCommon("unverified")}
            />
          );
          if (!hasValue) {
            editLabel = tCommon("add");
            onEdit = () => openEdit(f.key);
          } else if (!verified) {
            editLabel = t("verifyNow");
            onEdit = () => toast.info(tCommon("comingSoon"));
          } else {
            editLabel = undefined;
            onEdit = undefined;
          }
        } else {
          editLabel = hasValue ? tCommon("edit") : tCommon("add");
          onEdit = () => openEdit(f.key);
        }

        return (
          <RowItem
            key={f.key}
            icon={<f.icon size={16} stroke={1.75} />}
            label={t(f.key)}
            value={f.key === "gender" && val ? tGender(val) : val}
            placeholder={t("notAdded")}
            editLabel={editLabel}
            onEdit={onEdit}
            badge={badge}
          />
        );
      })}
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

      <EditModal open={!!editingKey} onClose={closeEdit} title={field ? t(field.key) : ""} dirty={dirty}>
        {field && (
          <div className="space-y-4">
            <FormField label={t(field.key)}>
              {field.type === "textarea" ? (
                <TextArea
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("notAdded")}
                  disabled={isSaving}
                />
              ) : field.type === "select" ? (
                <SelectInput value={draft} onChange={(e) => setDraft(e.target.value)} disabled={isSaving}>
                  <option value="">{t("notAdded")}</option>
                  <option value="female">{tGender("female")}</option>
                  <option value="male">{tGender("male")}</option>
                  <option value="other">{tGender("other")}</option>
                  <option value="prefer_not_to_say">{tGender("prefer_not_to_say")}</option>
                </SelectInput>
              ) : (
                <TextInput
                  type={field.type}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("notAdded")}
                  disabled={isSaving}
                />
              )}
            </FormField>
            <div className="flex items-center gap-2.5 pt-2">
              <PrimaryButton onClick={save} disabled={isSaving || !dirty}>
                <span className="inline-flex items-center gap-2">
                  {isSaving && <IconLoader2 size={15} className="animate-spin" stroke={2} />}
                  {tCommon("save")}
                </span>
              </PrimaryButton>
              <button
                type="button"
                onClick={closeEdit}
                disabled={isSaving}
                className="px-4 py-2.5 text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
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