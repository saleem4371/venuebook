"use client";

/**
 * Payments — Saved Cards, UPI, Bank Accounts, GST Details, Billing Address,
 * Invoices, Refund Preference. Card list data is mock (data/
 * mockAccountData.js) — no saved-payment-method endpoint is confirmed in
 * services/*.js, so add/remove/edit all surface the same honest
 * "not connected yet" toast.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconCreditCard,
  IconQrcode,
  IconBuildingBank,
  IconReceipt,
  IconFileInvoice,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconCash,
} from "@tabler/icons-react";

import { useToast } from "@/components/ToastProvider";
import { MOCK_CARDS, MOCK_UPI, MOCK_BANK_ACCOUNTS, MOCK_INVOICES } from "../../data/mockAccountData";
import {
  SettingsCard,
  CardHeading,
  RowItem,
  EditDrawer,
  FormField,
  TextInput,
  PrimaryButton,
  StatusPill,
  ConfirmDialog,
  EmptyRow,
} from "../ui";

export default function Payments() {
  const t = useTranslations("accountSettings.payments");
  const tCommon = useTranslations("accountSettings.common");
  const toast = useToast();

  const [gstOpen, setGstOpen] = useState(false);
  const [gstin, setGstin] = useState("");
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingAddress, setBillingAddress] = useState("");
  const [refund, setRefund] = useState("original");
  const [removeTarget, setRemoveTarget] = useState(null);

  const comingSoon = () => toast.info(tCommon("comingSoon"));

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconCreditCard size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      {/* Saved cards */}
      <SubSection icon={<IconCreditCard size={15} stroke={1.75} />} title={t("savedCards")} onAdd={comingSoon} addLabel={t("addCard")}>
        {MOCK_CARDS.length === 0 ? (
          <EmptyRow icon={<IconCreditCard size={18} className="text-gray-400" />} title={t("noCards")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_CARDS.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{c.brand} •••• {c.last4}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{t("expires")} {c.expiry}</p>
                </div>
                <button onClick={() => setRemoveTarget({ type: "card", id: c.id })} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                  <IconTrash size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SubSection>

      {/* UPI */}
      <SubSection icon={<IconQrcode size={15} stroke={1.75} />} title={t("upi")} onAdd={comingSoon} addLabel={t("addUpi")}>
        {MOCK_UPI.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3.5 py-3">
            <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{u.vpa}</p>
            <button onClick={() => setRemoveTarget({ type: "upi", id: u.id })} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
              <IconTrash size={15} />
            </button>
          </div>
        ))}
      </SubSection>

      {/* Bank accounts */}
      <SubSection icon={<IconBuildingBank size={15} stroke={1.75} />} title={t("bankAccounts")} onAdd={comingSoon} addLabel={t("addBank")}>
        {MOCK_BANK_ACCOUNTS.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">{b.bankName} •••• {b.last4}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">{b.ifsc}</p>
            </div>
            <button onClick={() => setRemoveTarget({ type: "bank", id: b.id })} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
              <IconTrash size={15} />
            </button>
          </div>
        ))}
      </SubSection>

      <RowItem
        icon={<IconReceipt size={16} stroke={1.75} />}
        label={t("gstDetails")}
        value={gstin}
        placeholder={t("notAdded")}
        editLabel={tCommon("edit")}
        onEdit={() => setGstOpen(true)}
      />
      <RowItem
        icon={<IconMapPin size={16} stroke={1.75} />}
        label={t("billingAddress")}
        value={billingAddress}
        placeholder={t("notAdded")}
        editLabel={tCommon("edit")}
        onEdit={() => setBillingOpen(true)}
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

      {/* Invoices */}
      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 mb-3">
          <IconFileInvoice size={15} stroke={1.75} />
          {t("invoices")}
        </p>
        <ul className="space-y-2.5">
          {MOCK_INVOICES.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3 text-[12.5px]">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{inv.label}</p>
                <p className="text-gray-400 dark:text-gray-500 text-[11px]">{inv.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusPill tone={inv.status === "Paid" ? "green" : "gray"} label={inv.status} />
                <button onClick={comingSoon} className="text-violet-600 dark:text-violet-400 font-semibold text-[11.5px]">
                  {t("download")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <EditDrawer open={gstOpen} onClose={() => setGstOpen(false)} title={t("gstDetails")}>
        <div className="space-y-4">
          <FormField label={t("gstDetails")}>
            <TextInput value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="29ABCDE1234F1Z5" />
          </FormField>
          <PrimaryButton onClick={() => { comingSoon(); setGstOpen(false); }}>{tCommon("save")}</PrimaryButton>
        </div>
      </EditDrawer>

      <EditDrawer open={billingOpen} onClose={() => setBillingOpen(false)} title={t("billingAddress")}>
        <div className="space-y-4">
          <FormField label={t("billingAddress")}>
            <TextInput value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
          </FormField>
          <PrimaryButton onClick={() => { comingSoon(); setBillingOpen(false); }}>{tCommon("save")}</PrimaryButton>
        </div>
      </EditDrawer>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => { comingSoon(); setRemoveTarget(null); }}
        title={t("removeConfirmTitle")}
        description={t("removeConfirmDesc")}
        confirmLabel={tCommon("remove")}
        danger
      />
    </SettingsCard>
  );
}

function SubSection({ icon, title, onAdd, addLabel, children }) {
  return (
    <div className="mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200">
          {icon}
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
