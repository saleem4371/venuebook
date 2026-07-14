"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/InvoiceDocument.jsx
 *
 * The 3 real invoice documents behind a booking's "Invoice" action, as
 * tabs: a customer-facing Main Booking Invoice, and the two GST tax
 * invoices that back it (Venue/Farmstay Service, VenueBook Convenience
 * Fee). This mirrors how Indian marketplace invoicing actually works —
 * the venue/farmstay is the real supplier of the accommodation and issues
 * its own tax invoice, VenueBook separately invoices only the convenience
 * fee it charges on top. Only action here is Download (print-to-PDF via
 * the browser's own print dialog — no fake "downloading…" state and no
 * new dependency, since there's no backend PDF endpoint yet).
 *
 * GST tax invoices are legally INR-denominated with paise precision
 * (₹17.82, not ₹18) — the app-wide useCurrency().format() intentionally
 * rounds INR to whole rupees for everyday browsing (see lib/currency.js),
 * so it is deliberately NOT used here. A local 2-decimal INR formatter is
 * used instead, without touching the shared currency system.
 */

import { useId, useState } from "react";
import { Download } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { GhostButton } from "./ui";
import { MOCK_CONVENIENCE_FEE_INR, VENUEBOOK_GSTIN, deriveInvoiceNumbers } from "../../data/mockProfileData";

const formatINR2dp = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDDMonYYYY = (date) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .format(date)
    .replace(/ /g, "-");

const formatLongDate = (date) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(date);

const TABS = ["main", "venue", "fee"];

export function InvoiceDocument({ booking: b, t }) {
  const { user } = useAuth();
  const rawId = useId();
  const printId = `invoice-print-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [tab, setTab] = useState("main");

  const hasPayment = b.amountINR > 0;
  const isFarmstay = b.category === "farmstays";

  // No separate "purchase date" field on the mock booking — a stable,
  // deterministic date a few days ahead of the stay/event reads sensibly
  // as "when the customer paid" without adding a new mock field.
  const eventDate = new Date(b.date);
  const invoiceDateObj = new Date(eventDate);
  invoiceDateObj.setDate(invoiceDateObj.getDate() - 5);
  const checkOutObj = new Date(eventDate);
  checkOutObj.setDate(checkOutObj.getDate() + (b.nights || 1));

  const { vendorInvoiceNo, feeInvoiceNo, transactionId } = deriveInvoiceNumbers(b.bookingId);

  // Venue/Farmstay charge is GST-inclusive: back out the taxable value.
  const venueAmount = b.amountINR;
  const taxableValue = venueAmount / 1.18;
  const cgstVenue = taxableValue * 0.09;
  const sgstVenue = taxableValue * 0.09;

  // Convenience fee is a flat amount with GST added on top (not inclusive).
  const feeBase = MOCK_CONVENIENCE_FEE_INR;
  const cgstFee = feeBase * 0.09;
  const sgstFee = feeBase * 0.09;
  const feeTotal = feeBase + cgstFee + sgstFee;

  const grandTotal = venueAmount + feeTotal;

  const handleDownload = () => window.print();

  if (!hasPayment) {
    return (
      <p className="text-[12.5px] text-gray-500 dark:text-gray-400 py-2">{t("invoiceModal.unavailable")}</p>
    );
  }

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #${printId}, #${printId} * { visibility: visible; }
          #${printId} { position: absolute; inset: 0; width: 100%; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                tab === key
                  ? "bg-white dark:bg-gray-900 text-violet-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t(`invoiceModal.tabs.${key}`)}
            </button>
          ))}
        </div>
        <GhostButton onClick={handleDownload} className="shrink-0">
          <Download size={13} />
          {t("invoiceModal.download")}
        </GhostButton>
      </div>

      <div id={printId}>
        {tab === "main" && (
          <DocCard headerTone="dark" title={t("invoiceModal.main.docTitle")} subtitle={t("invoiceModal.main.docSubtitle")}>
            <FieldRow label={t("invoiceModal.main.bookingId")} value={b.bookingId} />
            <FieldRow label={t("invoiceModal.main.invoiceDate")} value={formatDDMonYYYY(invoiceDateObj)} />
            <FieldRow label={t("invoiceModal.main.customerName")} value={user?.name || "—"} />
            <FieldRow label={t("invoiceModal.main.customerMobile")} value={user?.phone || "—"} />
            <FieldRow label={t("invoiceModal.main.customerEmail")} value={user?.email || "—"} />
            <FieldRow label={t("invoiceModal.main.venue")} value={b.propertyName} />
            <FieldRow label={t("invoiceModal.main.vendor")} value={b.vendorName} />
            {isFarmstay ? (
              <>
                <FieldRow label={t("invoiceModal.main.checkIn")} value={formatDDMonYYYY(eventDate)} />
                <FieldRow label={t("invoiceModal.main.checkOut")} value={formatDDMonYYYY(checkOutObj)} />
              </>
            ) : (
              <FieldRow label={t("invoiceModal.main.eventDateTime")} value={formatDDMonYYYY(eventDate)} />
            )}
            <FieldRow label={t("invoiceModal.main.paymentStatus")} value={t(`payment.${b.paymentStatus}`)} />
            <FieldRow label={t("invoiceModal.main.paymentMode")} value={b.paymentMode} />
            <FieldRow label={t("invoiceModal.main.transactionId")} value={transactionId} />

            <div className="mt-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <p className="px-3 py-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                {t("invoiceModal.main.paymentSummary")}
              </p>
              <div className="px-3 py-1">
                <AmountRow label={t("invoiceModal.main.venueCharges")} value={formatINR2dp(venueAmount)} />
                <AmountRow label={t("invoiceModal.main.convenienceFee")} value={formatINR2dp(feeBase)} />
                <AmountRow label={t("invoiceModal.main.gstOnFee")} value={formatINR2dp(cgstFee + sgstFee)} />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 font-bold text-[13px] text-gray-900 dark:text-gray-50">
                <span>{t("invoiceModal.main.grandTotal")}</span>
                <span>{formatINR2dp(grandTotal)}</span>
              </div>
            </div>
          </DocCard>
        )}

        {tab === "venue" && (
          <DocCard headerTone="accent" title={t("invoiceModal.tax.venueHeading")} subtitle={`${t("invoiceModal.tax.supplier")}: ${b.vendorName}`}>
            <FieldRow label={t("invoiceModal.tax.invoiceNo")} value={vendorInvoiceNo} />
            <FieldRow label={t("invoiceModal.tax.invoiceDate")} value={formatLongDate(invoiceDateObj)} />
            <FieldRow label={t("invoiceModal.tax.gstin")} value={b.vendorGSTIN} />
            <FieldRow label={t("invoiceModal.tax.placeOfSupply")} value={b.placeOfSupply} />

            <DescriptionTable
              t={t}
              rows={[
                {
                  description: isFarmstay ? t("invoiceModal.tax.farmstayBooking") : t("invoiceModal.tax.venueBooking"),
                  qty: 1,
                  amount: `${formatINR2dp(venueAmount)} (${t("invoiceModal.tax.inclusiveOfGst")})`,
                },
              ]}
            />

            <GstBreakup
              t={t}
              rows={[
                { label: t("invoiceModal.tax.taxableValue"), value: formatINR2dp(taxableValue) },
                { label: t("invoiceModal.tax.cgst"), value: formatINR2dp(cgstVenue) },
                { label: t("invoiceModal.tax.sgst"), value: formatINR2dp(sgstVenue) },
              ]}
              totalLabel={t("invoiceModal.tax.invoiceTotal")}
              totalValue={formatINR2dp(venueAmount)}
            />

            <p className="mt-3 text-[10.5px] text-gray-400 dark:text-gray-500 italic">
              {t("invoiceModal.tax.venueFooter", { vendor: b.vendorName })}
            </p>
          </DocCard>
        )}

        {tab === "fee" && (
          <DocCard headerTone="accent" title={t("invoiceModal.tax.feeHeading")} subtitle={`${t("invoiceModal.tax.supplier")}: VenueBook.in`}>
            <FieldRow label={t("invoiceModal.tax.invoiceNo")} value={feeInvoiceNo} />
            <FieldRow label={t("invoiceModal.tax.invoiceDate")} value={formatLongDate(invoiceDateObj)} />
            <FieldRow label={t("invoiceModal.tax.gstin")} value={VENUEBOOK_GSTIN} />

            <DescriptionTable
              t={t}
              showQty={false}
              rows={[{ description: t("invoiceModal.tax.convenienceFee"), amount: formatINR2dp(feeBase) }]}
            />

            <GstBreakup
              t={t}
              rows={[
                { label: t("invoiceModal.tax.cgst"), value: formatINR2dp(cgstFee) },
                { label: t("invoiceModal.tax.sgst"), value: formatINR2dp(sgstFee) },
              ]}
              totalLabel={t("invoiceModal.tax.invoiceTotal")}
              totalValue={formatINR2dp(feeTotal)}
            />

            <p className="mt-3 text-[10.5px] text-gray-400 dark:text-gray-500 italic">
              {t("invoiceModal.tax.feeFooter")}
            </p>
          </DocCard>
        )}
      </div>
    </div>
  );
}

function DocCard({ title, subtitle, headerTone = "dark", children }) {
  const headerClass =
    headerTone === "accent"
      ? "bg-violet-600 text-white"
      : "bg-gray-900 dark:bg-black text-white";
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className={`px-3.5 py-3 ${headerClass}`}>
        <p className="text-[12.5px] font-bold leading-tight">{title}</p>
        {subtitle && <p className="text-[10.5px] opacity-80 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-3.5 bg-gray-50/60 dark:bg-gray-800/30">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-[12px] border-b border-dashed border-gray-200/80 dark:border-gray-700/60 last:border-b-0">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{value}</span>
    </div>
  );
}

function AmountRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12px]">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-50">{value}</span>
    </div>
  );
}

function DescriptionTable({ t, rows, showQty = true }) {
  return (
    <div className="mt-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
        <span className="flex-1">{t("invoiceModal.tax.description")}</span>
        {showQty && <span className="w-10 text-right">{t("invoiceModal.tax.qty")}</span>}
        <span className="w-28 text-right">{t("invoiceModal.tax.amount")}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 text-[12px]">
          <span className="flex-1 text-gray-800 dark:text-gray-200">{r.description}</span>
          {showQty && <span className="w-10 text-right text-gray-600 dark:text-gray-300">{r.qty}</span>}
          <span className="w-28 text-right font-medium text-gray-900 dark:text-gray-50">{r.amount}</span>
        </div>
      ))}
    </div>
  );
}

function GstBreakup({ t, rows, totalLabel, totalValue }) {
  return (
    <div className="mt-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 py-1">
        {rows.map((r, i) => (
          <AmountRow key={i} label={r.label} value={r.value} />
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 font-bold text-[13px] text-gray-900 dark:text-gray-50">
        <span>{totalLabel}</span>
        <span>{totalValue}</span>
      </div>
    </div>
  );
}
