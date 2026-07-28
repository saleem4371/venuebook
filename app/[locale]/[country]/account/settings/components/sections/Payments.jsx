"use client";

/**
 * Payments — Saved Cards, UPI, Bank Accounts, GST Details, Billing Address,
 * Refund Preference, and a link out to Bookings/Invoices (the in-page
 * invoice list was removed — invoices belong with the bookings they're
 * tied to, not duplicated here). Card list data is mock (data/
 * mockAccountData.js) — no saved-payment-method endpoint is confirmed in
 * services/*.js, so add/remove/edit all surface the same honest
 * "not connected yet" toast.
 *
 * Each payment type gets its own accent color (cards = blue, UPI = emerald,
 * bank accounts = amber) purely for visual separation between the three
 * lists. One method per type can be marked Default. Removing a method that
 * a mock record flags `lockedByBooking` shows a blocking (non-destructive)
 * dialog instead of the normal remove confirmation — it can't be deleted
 * while it's referenced by an active/completed booking.
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IconCreditCard,
  IconQrcode,
  IconBuildingBank,
  IconFileInvoice,
  IconReceipt,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconCash,
  IconChevronRight,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_CARDS, MOCK_UPI, MOCK_BANK_ACCOUNTS } from "../../data/mockAccountData";
import {
  SettingsCard,
  CardHeading,
  RowItem,
  ToggleRow,
  EditModal,
  FormField,
  TextInput,
  PrimaryButton,
  StatusPill,
  ConfirmDialog,
  EmptyRow,
} from "../ui";

const ACCENTS = {
  card: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  upi: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  bank: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function Payments() {
  const t = useTranslations("accountSettings.payments");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();
  const { locale, country } = useParams();

  const [isOrganization, setIsOrganization] = useState(false);
  const [gstOpen, setGstOpen] = useState(false);
  const [gstin, setGstin] = useState("");
  const [sameAsResidential, setSameAsResidential] = useState(true);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingAddress, setBillingAddress] = useState("");
  const [refund, setRefund] = useState("original");
  const [removeTarget, setRemoveTarget] = useState(null);

  const comingSoon = () => toast.info(tCommon("comingSoon"));

  const requestRemove = (type, item) => setRemoveTarget({ type, id: item.id, locked: !!item.lockedByBooking });

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconCreditCard size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      {/* Saved cards */}
      <SubSection accent={ACCENTS.card} icon={<IconCreditCard size={15} stroke={1.75} />} title={t("savedCards")} onAdd={comingSoon} addLabel={t("addCard")}>
        {MOCK_CARDS.length === 0 ? (
          <EmptyRow icon={<IconCreditCard size={18} className="text-gray-400" />} title={t("noCards")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_CARDS.map((c) => (
              <PaymentRow
                key={c.id}
                accent={ACCENTS.card}
                icon={<IconCreditCard size={15} stroke={1.75} />}
                title={`${c.brand} •••• ${c.last4}`}
                subtitle={`${t("expires")} ${c.expiry}`}
                isDefault={c.isDefault}
                onSetDefault={comingSoon}
                onRemove={() => requestRemove("card", c)}
                t={t}
                tCommon={tCommon}
              />
            ))}
          </div>
        )}
      </SubSection>

      {/* UPI */}
      <SubSection accent={ACCENTS.upi} icon={<IconQrcode size={15} stroke={1.75} />} title={t("upi")} onAdd={comingSoon} addLabel={t("addUpi")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MOCK_UPI.map((u) => (
            <PaymentRow
              key={u.id}
              accent={ACCENTS.upi}
              icon={<IconQrcode size={15} stroke={1.75} />}
              title={u.vpa}
              isDefault={u.isDefault}
              onSetDefault={comingSoon}
              onRemove={() => requestRemove("upi", u)}
              t={t}
              tCommon={tCommon}
            />
          ))}
        </div>
      </SubSection>

      {/* Bank accounts */}
      <SubSection accent={ACCENTS.bank} icon={<IconBuildingBank size={15} stroke={1.75} />} title={t("bankAccounts")} onAdd={comingSoon} addLabel={t("addBank")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MOCK_BANK_ACCOUNTS.map((b) => (
            <PaymentRow
              key={b.id}
              accent={ACCENTS.bank}
              icon={<IconBuildingBank size={15} stroke={1.75} />}
              title={`${b.bankName} •••• ${b.last4}`}
              subtitle={b.ifsc}
              isDefault={b.isDefault}
              onSetDefault={comingSoon}
              onRemove={() => requestRemove("bank", b)}
              t={t}
              tCommon={tCommon}
            />
          ))}
        </div>
      </SubSection>

      {/* GST — optional, only relevant for organisation/business accounts */}
      <ToggleRow
        label={t("isOrganization")}
        description={t("isOrganizationDesc")}
        checked={isOrganization}
        onChange={(v) => { setIsOrganization(v); comingSoon(); }}
      />
      {isOrganization && (
        <RowItem
          icon={<IconReceipt size={16} stroke={1.75} />}
          label={t("gstDetailsOptional")}
          value={gstin}
          placeholder={t("notAdded")}
          editLabel={tCommon("edit")}
          onEdit={() => setGstOpen(true)}
        />
      )}

      {/* Billing address — same as residential by default */}
      <ToggleRow
        label={t("sameAsResidential")}
        checked={sameAsResidential}
        onChange={(v) => setSameAsResidential(v)}
      />
      <RowItem
        icon={<IconMapPin size={16} stroke={1.75} />}
        label={t("billingAddress")}
        value={sameAsResidential ? t("sameAsResidentialValue") : billingAddress}
        placeholder={t("notAdded")}
        editLabel={sameAsResidential ? undefined : tCommon("edit")}
        onEdit={sameAsResidential ? undefined : () => setBillingOpen(true)}
      />

      <RowItem
        icon={<IconCash size={16} stroke={1.75} />}
        label={t("refundPreference")}
        value={t(`refundOptions.${refund}`)}
        editLabel={tCommon("edit")}
        onEdit={() => {
          setRefund((r) => (r === "original" ? "wallet" : "original"));
          comingSoon();
        }}
        last
      />

      {/* Invoices now live with the bookings they belong to — this just
          links out to Bookings instead of duplicating the list here. */}
      <Link
        href={`/${locale}/${country}/profile?section=bookings`}
        className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
            <IconFileInvoice size={16} className="text-gray-500 dark:text-gray-400" stroke={1.75} />
          </span>
          <span className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">{t("viewInvoices")}</span>
        </span>
        <IconChevronRight size={16} className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180" />
      </Link>

      <EditModal open={gstOpen} onClose={() => setGstOpen(false)} title={t("gstDetailsOptional")}>
        <div className="space-y-4">
          <FormField label={t("gstDetailsOptional")}>
            <TextInput value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="29ABCDE1234F1Z5" />
          </FormField>
          <PrimaryButton onClick={() => { comingSoon(); setGstOpen(false); }}>{tCommon("save")}</PrimaryButton>
        </div>
      </EditModal>

      <EditModal open={billingOpen} onClose={() => setBillingOpen(false)} title={t("billingAddress")}>
        <div className="space-y-4">
          <FormField label={t("billingAddress")}>
            <TextInput value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
          </FormField>
          <PrimaryButton onClick={() => { comingSoon(); setBillingOpen(false); }}>{tCommon("save")}</PrimaryButton>
        </div>
      </EditModal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={removeTarget?.locked ? () => setRemoveTarget(null) : () => { comingSoon(); setRemoveTarget(null); }}
        title={removeTarget?.locked ? t("removeBlockedTitle") : t("removeConfirmTitle")}
        description={removeTarget?.locked ? t("removeBlockedDesc") : t("removeConfirmDesc")}
        confirmLabel={removeTarget?.locked ? tCommon("close") : tCommon("remove")}
        danger={!removeTarget?.locked}
      />
    </SettingsCard>
  );
}

function SubSection({ icon, accent, title, onAdd, addLabel, children }) {
  return (
    <div className="mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200">
          <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${accent}`}>{icon}</span>
          {title}
        </p>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300">
          <IconPlus size={13} stroke={2} />
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PaymentRow({ accent, icon, title, subtitle, isDefault, onSetDefault, onRemove, t, tCommon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3.5 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50 truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isDefault ? (
          <StatusPill tone="violet" label={t("defaultMethod")} />
        ) : (
          <button onClick={onSetDefault} className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap">
            {t("setAsDefault")}
          </button>
        )}
        <button onClick={onRemove} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors" aria-label={tCommon("remove")}>
          <IconTrash size={15} />
        </button>
      </div>
    </div>
  );
}
