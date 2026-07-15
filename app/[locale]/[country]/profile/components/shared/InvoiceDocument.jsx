"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/InvoiceDocument.jsx
 *
 * The invoice documents behind a booking's "Invoice" action, as 2 tabs:
 * a customer-facing Main Booking Invoice, and a Tax Invoice tab.
 *
 * The Tax Invoice tab's shape depends on whether the vendor itself is GST
 * registered (`booking.gstRegistered`, see mockProfileData.js's
 * MOCK_BOOKINGS header comment for the full demo matrix):
 *   - registered   → TWO real tax invoices stacked: the vendor's own
 *     (for the venue/farmstay charge) and venuebook.in's (for the
 *     convenience fee) — two different suppliers, two different GSTINs,
 *     as real Indian marketplace invoicing requires.
 *   - not registered → an unregistered vendor legally cannot issue a GST
 *     tax invoice, so venuebook.in issues ONE combined tax invoice
 *     covering both the venue/farmstay charge and the convenience fee
 *     (buildCombinedModel). Every intra-/inter-state (CGST+SGST vs IGST)
 *     determination in that single document uses venuebook.in's own
 *     state against the booking's customerState — there's no vendor
 *     place-of-supply to compare against once the vendor isn't the one
 *     issuing tax.
 *
 * The tabs+Download/Print row is sticky at the top of the modal's
 * scrollable body, so it stays visible while a long document scrolls
 * underneath.
 *
 * Design is an original, app-consistent document layout (real venuebook.in
 * logo, the app's own card/badge/stat-label tokens) carrying the same
 * content a finance team's reference mockups specified — not a pixel
 * clone of those mockups. Content is category-driven throughout (not a
 * venue/farmstay binary): the description line, the "stay" fields
 * (check-in/out vs. a single event date/time), and the Payment Summary's
 * charges label all read the booking's actual category via `tCat`, so a
 * studio/workspace/rental/experience booking gets correctly-worded
 * content instead of being force-fit into "Venue" or "Farmstay" wording.
 * The one deliberate venue/farmstay split left is the Main Invoice's
 * total line: venues never redeem loyalty points on a booking (product
 * rule), so they get a single bold "Grand Total Paid"; farmstays show a
 * Gross Invoice Value subtotal, the loyalty redemption as its own
 * deduction, then a final bold Net Payable Value.
 *
 * Download hits the REAL backend (services/booking.service.js's
 * download_invoice → GET {NEXT_PUBLIC_API_URL}/invoice/download/:id,
 * responseType "blob") and saves the actual PDF the backend returns — this
 * is the one real, non-mock action on this page, everything else here is
 * still mock booking data. `booking.invoiceId` is currently a shared
 * placeholder id (see mockProfileData.js) since the mock bookings don't
 * have real backend rows of their own yet; every booking downloads the
 * same real PDF until that's wired up for real.
 *
 * Print renders a second, print-only copy of the same document cards
 * through a React portal straight into document.body (see the bottom of
 * this file) — deliberately NOT relying on `window.print()` printing the
 * on-screen modal in place, because that modal is `position: fixed` with
 * `overflow-hidden`/`max-h-[85vh]` and framer-motion leaves a `transform`
 * on it, which together are exactly the combination that clips or blanks
 * out fixed/absolutely-positioned content when a browser paginates for
 * print. A body-level portal sidesteps all of that; a single global
 * `@media print` rule hides everything else on the page so only the
 * invoice prints.
 *
 * GST tax invoices are legally INR-denominated with paise precision
 * (₹17.82, not ₹18) — the app-wide useCurrency().format() intentionally
 * rounds INR to whole rupees for everyday browsing (see lib/currency.js),
 * so it is deliberately NOT used here. A local 2-decimal INR formatter is
 * used instead, without touching the shared currency system.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Printer, Loader2, FileText, Receipt, User, MapPin, CreditCard } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { download_invoice } from "@/services/booking.service";
import { GhostButton } from "./ui";
import {
  MOCK_CONVENIENCE_FEE_INR,
  MOCK_DISCOUNT_INR,
  MOCK_VB_LOYALTY_DISCOUNT_INR,
  VENUEBOOK_GSTIN,
  VENUEBOOK_STATE,
  deriveInvoiceNumbers,
} from "../../data/mockProfileData";
import lightLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo.png";

/**
 * Categories that are booked as a stay (a range of nights, check-in/out)
 * rather than a single event/slot. Farmstays and rentals are the two
 * "you stay there" categories in the taxonomy; venues, studios,
 * workspaces, and experiences are all booked for a specific date/time.
 */
const STAY_BASED_CATEGORIES = new Set(["farmstays", "rentals"]);

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

const TABS = [
  { key: "main", Icon: FileText },
  { key: "tax", Icon: Receipt },
];

export function InvoiceDocument({ booking: b, t, tCat }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("main");
  const [pdfState, setPdfState] = useState("idle"); // idle | loading | error

  const hasInvoice = Boolean(b.invoiceId);
  const isStayBased = STAY_BASED_CATEGORIES.has(b.category);
  const isFarmstay = b.category === "farmstays";
  const isRegistered = Boolean(b.gstRegistered);
  const categoryLabel = tCat(b.category.replace(/s$/, ""));

  // No separate "purchase date" field on the mock booking — a stable,
  // deterministic date a few days ahead of the stay/event reads sensibly
  // as "when the customer paid" without adding a new mock field.
  const eventDate = new Date(b.date);
  const invoiceDateObj = new Date(eventDate);
  invoiceDateObj.setDate(invoiceDateObj.getDate() - 5);
  const checkOutObj = new Date(eventDate);
  checkOutObj.setDate(checkOutObj.getDate() + (b.nights || 1));

  const { mainInvoiceNo, vendorInvoiceNo, feeInvoiceNo, transactionId } = deriveInvoiceNumbers(b.bookingId);

  // CGST+SGST only applies when the supplier and the customer are in the
  // SAME state; a different state means it's an inter-state supply and
  // IGST applies instead — real GST law. `isIntraStateVendor` only ever
  // matters when the vendor itself is the supplier issuing tax (the
  // registered scenario's vendor document); `isIntraStateVB` covers every
  // document venuebook.in itself issues as supplier — its own Fee
  // invoice in the registered scenario, AND the single Combined invoice
  // in the unregistered scenario, since venuebook.in is the one supplier
  // either way.
  const isIntraStateVendor = b.placeOfSupply === b.customerState;
  const isIntraStateVB = VENUEBOOK_STATE === b.customerState;

  // Venue/Farmstay charge is GST-inclusive: back out the taxable value.
  // This undiscounted `taxableValue` is what the Tax Invoice tab's own
  // cgst/sgst/igst math is based on below — the vendor/venuebook.in's
  // actual declared GST invoice isn't affected by a customer-facing
  // discount (see the discount comment further down), only the Main
  // Invoice's own summary is.
  const venueAmount = b.amountINR;
  const taxableValue = venueAmount / 1.18;
  const cgstVenue = taxableValue * 0.09;
  const sgstVenue = taxableValue * 0.09;
  const igstVenue = taxableValue * 0.18;

  // Convenience fee is a flat amount with GST added on top (not inclusive).
  const feeBase = MOCK_CONVENIENCE_FEE_INR;
  const cgstFee = feeBase * 0.09;
  const sgstFee = feeBase * 0.09;
  const igstFee = feeBase * 0.18;
  const feeTotal = feeBase + (isIntraStateVB ? cgstFee + sgstFee : igstFee);

  // Discounts only ever appear on the Main Invoice — the GST tax
  // invoice(s) report what the vendor/venuebook.in actually charged and
  // taxed, unaffected by a customer-facing discount or loyalty redemption.
  const discount = MOCK_DISCOUNT_INR;
  const loyaltyDiscount = MOCK_VB_LOYALTY_DISCOUNT_INR;

  // Main Invoice only: GST is computed on the taxable value AFTER the
  // discount is applied (the discount reduces the pre-tax base, not just
  // the final total) — with no discount this is identical to taxing the
  // full taxableValue, so nothing special is needed for that case.
  const discountedTaxableValue = Math.max(taxableValue - discount, 0);
  const gstOnVenue = discountedTaxableValue * 0.18;
  const venueChargeAfterDiscount = discountedTaxableValue + gstOnVenue;

  // "Gross Invoice Value" = the discounted, taxed venue/farmstay charge
  // plus the (undiscounted) convenience fee, before loyalty. Venues stop
  // there (bold "Grand Total Paid" — no loyalty redemption on a venue
  // booking, ever, per product rule); farmstays subtract loyaltyDiscount
  // on top for a final "Net Payable Value".
  const grossInvoiceValue = venueChargeAfterDiscount + feeTotal;
  const netPayable = grossInvoiceValue - loyaltyDiscount;

  const buildMainModel = () => ({
    docType: t("invoiceModal.tabs.main"),
    title: t("invoiceModal.main.docTitle"),
    subtitle: t("invoiceModal.main.docSubtitle"),
    fieldGroups: [
      {
        heading: t("invoiceModal.main.groupInvoice"),
        Icon: FileText,
        fields: [
          { label: t("invoiceModal.main.bookingId"), value: b.bookingId },
          { label: t("invoiceModal.main.invoiceNo"), value: mainInvoiceNo },
          { label: t("invoiceModal.main.invoiceDate"), value: formatDDMonYYYY(invoiceDateObj) },
        ],
      },
      {
        heading: t("invoiceModal.main.groupCustomer"),
        Icon: User,
        fields: [
          { label: t("invoiceModal.main.customerName"), value: user?.name || "—" },
          { label: t("invoiceModal.main.customerMobile"), value: user?.phone || "—" },
          { label: t("invoiceModal.main.customerEmail"), value: user?.email || "—" },
        ],
      },
      {
        heading: t("invoiceModal.main.groupBooking"),
        Icon: MapPin,
        fields: [
          { label: t("invoiceModal.main.venue"), value: b.propertyName },
          { label: t("invoiceModal.main.vendor"), value: b.vendorName },
          isStayBased
            ? { label: t("invoiceModal.main.checkIn"), value: formatDDMonYYYY(eventDate) }
            : { label: t("invoiceModal.main.eventDateTime"), value: formatDDMonYYYY(eventDate) },
          ...(isStayBased ? [{ label: t("invoiceModal.main.checkOut"), value: formatDDMonYYYY(checkOutObj) }] : []),
        ],
      },
      {
        heading: t("invoiceModal.main.groupPayment"),
        Icon: CreditCard,
        fields: [
          { label: t("invoiceModal.main.paymentStatus"), value: t(`payment.${b.paymentStatus}`) },
          { label: t("invoiceModal.main.paymentMode"), value: b.paymentMode },
          { label: t("invoiceModal.main.transactionId"), value: transactionId },
        ],
      },
    ],
    table: null,
    // Order matters here — DocCard renders `summary` rows in array order,
    // only using `bold` to style a row as a subtotal/total bar, not to
    // reshuffle it to the bottom. That's what lets the farmstay case
    // interleave a bold subtotal (Gross Invoice Value) in the MIDDLE of
    // the list, followed by a regular deduction row, then a second bold
    // total — not just one bold row stuck at the very end.
    summary: [
      { label: t("invoiceModal.main.taxableValueLabel", { category: categoryLabel }), value: formatINR2dp(taxableValue) },
      { label: t("invoiceModal.main.discount"), value: `-${formatINR2dp(discount)}` },
      { label: t("invoiceModal.main.gstIncludedLabel"), value: formatINR2dp(gstOnVenue) },
      { label: t("invoiceModal.main.convenienceFee"), value: formatINR2dp(feeBase) },
      { label: t("invoiceModal.main.gstOnFee"), value: formatINR2dp(feeBase * 0.18) },
      ...(isFarmstay
        ? [
            { label: t("invoiceModal.main.grossInvoiceValue"), value: formatINR2dp(grossInvoiceValue), bold: true },
            { label: t("invoiceModal.main.vbDiscount"), value: `-${formatINR2dp(loyaltyDiscount)}` },
            { label: t("invoiceModal.main.netPayable"), value: formatINR2dp(netPayable), bold: true },
          ]
        : [{ label: t("invoiceModal.main.grandTotal"), value: formatINR2dp(grossInvoiceValue), bold: true }]),
    ],
    footer: t("invoiceModal.main.footerNote"),
  });

  // Registered scenario only — the vendor's own tax invoice for the
  // venue/farmstay charge.
  const buildVendorModel = () => ({
    docType: t("invoiceModal.tabs.venue"),
    title: t("invoiceModal.tabs.tax"),
    subtitle: `${t("invoiceModal.tax.supplier")}: ${b.vendorName}`,
    fields: [
      { label: t("invoiceModal.tax.invoiceNo"), value: vendorInvoiceNo },
      { label: t("invoiceModal.tax.invoiceDate"), value: formatLongDate(invoiceDateObj) },
      { label: t("invoiceModal.tax.gstin"), value: b.vendorGSTIN },
      { label: t("invoiceModal.tax.placeOfSupply"), value: b.placeOfSupply },
    ],
    table: {
      headers: [t("invoiceModal.tax.description"), t("invoiceModal.tax.amount")],
      rows: [
        [
          t("invoiceModal.tax.categoryBookingLabel", { category: categoryLabel }),
          1,
          `${formatINR2dp(venueAmount)} (${t("invoiceModal.tax.inclusiveOfGst")})`,
        ],
      ],
    },
    summary: [
      { label: t("invoiceModal.tax.taxableValue"), value: formatINR2dp(taxableValue) },
      ...(isIntraStateVendor
        ? [
            { label: t("invoiceModal.tax.cgst"), value: formatINR2dp(cgstVenue) },
            { label: t("invoiceModal.tax.sgst"), value: formatINR2dp(sgstVenue) },
          ]
        : [{ label: t("invoiceModal.tax.igst"), value: formatINR2dp(igstVenue) }]),
      { label: t("invoiceModal.tax.invoiceTotal"), value: formatINR2dp(venueAmount), bold: true },
    ],
    footer: t("invoiceModal.tax.venueFooter", { vendor: b.vendorName }),
  });

  // Registered scenario only — venuebook.in's own tax invoice for the
  // convenience fee (the vendor's charge is taxed separately above).
  const buildFeeModel = () => ({
    docType: t("invoiceModal.tabs.fee"),
    title: t("invoiceModal.tabs.tax"),
    subtitle: `${t("invoiceModal.tax.supplier")}: venuebook.in`,
    fields: [
      { label: t("invoiceModal.tax.invoiceNo"), value: feeInvoiceNo },
      { label: t("invoiceModal.tax.invoiceDate"), value: formatLongDate(invoiceDateObj) },
      { label: t("invoiceModal.tax.gstin"), value: VENUEBOOK_GSTIN },
    ],
    table: {
      headers: [t("invoiceModal.tax.description"), t("invoiceModal.tax.amount")],
      rows: [[t("invoiceModal.tax.convenienceFee"), formatINR2dp(feeBase)]],
    },
    summary: [
      ...(isIntraStateVB
        ? [
            { label: t("invoiceModal.tax.cgst"), value: formatINR2dp(cgstFee) },
            { label: t("invoiceModal.tax.sgst"), value: formatINR2dp(sgstFee) },
          ]
        : [{ label: t("invoiceModal.tax.igst"), value: formatINR2dp(igstFee) }]),
      { label: t("invoiceModal.tax.invoiceTotal"), value: formatINR2dp(feeTotal), bold: true },
    ],
    footer: t("invoiceModal.tax.feeFooter"),
  });

  // Unregistered scenario only — an unregistered vendor can't issue GST
  // tax, so venuebook.in issues ONE tax invoice covering both the
  // venue/farmstay charge (as the first line, per product spec — "venue
  // name, venue price, tax") and the convenience fee, one supplier, one
  // intra-/inter-state determination (isIntraStateVB) for the whole thing.
  const buildCombinedModel = () => {
    const combinedTotal = venueAmount + feeTotal;
    return {
      docType: t("invoiceModal.tabs.combined"),
      title: t("invoiceModal.tabs.tax"),
      subtitle: `${t("invoiceModal.tax.supplier")}: venuebook.in`,
      badge: t("invoiceModal.tax.notRegisteredBadge"),
      fields: [
        { label: t("invoiceModal.tax.invoiceNo"), value: feeInvoiceNo },
        { label: t("invoiceModal.tax.invoiceDate"), value: formatLongDate(invoiceDateObj) },
        { label: t("invoiceModal.tax.gstin"), value: VENUEBOOK_GSTIN },
      ],
      table: {
        headers: [t("invoiceModal.tax.description"), t("invoiceModal.tax.amount")],
        rows: [
          [
            t("invoiceModal.tax.categoryBookingLabel", { category: categoryLabel }),
            1,
            `${formatINR2dp(venueAmount)} (${t("invoiceModal.tax.inclusiveOfGst")})`,
          ],
          [t("invoiceModal.tax.convenienceFee"), 1, formatINR2dp(feeBase)],
        ],
      },
      summary: [
        { label: t("invoiceModal.tax.taxableValue"), value: formatINR2dp(taxableValue + feeBase) },
        ...(isIntraStateVB
          ? [
              { label: t("invoiceModal.tax.cgst"), value: formatINR2dp(cgstVenue + cgstFee) },
              { label: t("invoiceModal.tax.sgst"), value: formatINR2dp(sgstVenue + sgstFee) },
            ]
          : [{ label: t("invoiceModal.tax.igst"), value: formatINR2dp(igstVenue + igstFee) }]),
        { label: t("invoiceModal.tax.invoiceTotal"), value: formatINR2dp(combinedTotal), bold: true },
      ],
      footer: t("invoiceModal.tax.combinedFooter", { vendor: b.vendorName, category: categoryLabel }),
    };
  };

  // "tax" is either two real documents (registered vendor) or one
  // combined document (unregistered vendor) stacked under one tab;
  // "main" is always just the one.
  const models =
    tab === "tax" ? (isRegistered ? [buildVendorModel(), buildFeeModel()] : [buildCombinedModel()]) : [buildMainModel()];

  const handleDownload = async () => {
    if (!b.invoiceId) return;
    setPdfState("loading");
    try {
      const res = await download_invoice(b.invoiceId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${b.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch (_) {
      setPdfState("error");
      setTimeout(() => setPdfState("idle"), 2500);
    }
  };

  const handlePrint = () => window.print();

  if (!hasInvoice) {
    return <p className="text-[12.5px] text-gray-500 dark:text-gray-400 py-2">{t("invoiceModal.unavailable")}</p>;
  }

  const docCards = models.map((model, i) => <DocCard key={i} model={model} t={t} />);

  return (
    <>
      <div>
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="flex-1 min-w-0 flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60">
            {TABS.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11.5px] font-semibold transition-all duration-150 whitespace-nowrap ${
                  tab === key
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/70 dark:hover:bg-gray-900/40"
                }`}
              >
                <Icon size={13} />
                {t(`invoiceModal.tabs.${key}`)}
              </button>
            ))}
          </div>

          <GhostButton onClick={handlePrint} className="shrink-0">
            <Printer size={13} />
            {t("invoiceModal.print")}
          </GhostButton>

          {pdfState === "error" ? (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 text-[11.5px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
            >
              {t("invoiceModal.downloadError")}
            </button>
          ) : (
            <GhostButton onClick={handleDownload} disabled={pdfState === "loading"} className="shrink-0">
              {pdfState === "loading" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {pdfState === "loading" ? t("invoiceModal.generating") : t("invoiceModal.download")}
            </GhostButton>
          )}
        </div>

        <div className="pt-4 space-y-4">{docCards}</div>
      </div>

      {/* Print-only copy, portalled straight to <body> — see this file's
          header comment for why the on-screen modal isn't printed in
          place. Invisible on screen (`hidden`), shown only inside
          `@media print` (`print:block`), at which point the accompanying
          <style> hides everything else on the page so only this prints. */}
      {typeof document !== "undefined" &&
        createPortal(
          <div id="invoice-print-root" className="hidden print:block">
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #invoice-print-root, #invoice-print-root * { visibility: visible; }
                #invoice-print-root {
                  position: absolute;
                  inset: 0;
                  padding: 24px;
                  background: #fff;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            `}</style>
            <div className="space-y-4">{docCards}</div>
          </div>,
          document.body,
        )}
    </>
  );
}

function DocCard({ model, t }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-600" />
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <img src={lightLogo.src ?? lightLogo} alt="venuebook.in" className="h-5 w-auto dark:hidden" />
        <img src={darkLogo.src ?? darkLogo} alt="venuebook.in" className="h-5 w-auto hidden dark:block" />
        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-700/40 shrink-0">
          {model.docType}
        </span>
      </div>
      <div className="px-4 pt-3 pb-3.5 bg-gray-50/60 dark:bg-gray-800/30">
        <p className="text-[13px] font-bold text-gray-900 dark:text-gray-50">{model.title}</p>
        {model.subtitle && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{model.subtitle}</p>}
        {model.badge && (
          <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40">
            {model.badge}
          </span>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
        {model.fieldGroups ? (
          <div className="rounded-xl bg-gray-50/60 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 divide-y divide-gray-200/70 dark:divide-gray-700/50 overflow-hidden">
            {model.fieldGroups.map((group, gi) => (
              <div key={gi} className="p-3.5">
                <p className="flex items-center gap-1.5 text-[9.5px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-2.5">
                  <group.Icon size={11} />
                  {group.heading}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {group.fields.map((f, fi) => (
                    <Field key={fi} label={f.label} value={f.value} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 p-3.5">
            {model.fields.map((f, i) => (
              <Field key={i} label={f.label} value={f.value} />
            ))}
          </div>
        )}

        {model.table && (
          <DescriptionTable
            t={t}
            showQty={model.table.rows[0]?.length === 3}
            rows={model.table.rows.map((r) =>
              r.length === 3 ? { description: r[0], qty: r[1], amount: r[2] } : { description: r[0], amount: r[1] },
            )}
          />
        )}

        {/* Rows render in array order — `bold` only changes a row's
            styling (a top-bordered, bold "subtotal/total" bar), it does
            NOT bucket bold rows to the end. That's required for the
            farmstay Main Invoice case: a bold "Gross Invoice Value"
            subtotal sits in the MIDDLE of this list, followed by a
            regular "Loyalty Redeemed" deduction, then a second bold
            "Net Payable Value" — order has to survive exactly as built. */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {model.summary.map((r, i) =>
            r.bold ? (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 font-bold text-[13px] text-gray-900 dark:text-gray-50"
              >
                <span>{r.label}</span>
                <span>{r.value}</span>
              </div>
            ) : (
              <div key={i} className="px-3">
                <AmountRow label={r.label} value={r.value} />
              </div>
            ),
          )}
        </div>

        {model.footer && <p className="text-[10.5px] text-gray-400 dark:text-gray-500 italic pt-1">{model.footer}</p>}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-100 mt-0.5 truncate" title={String(value)}>
        {value}
      </p>
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

function DescriptionTable({ t, rows, showQty }) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 text-[10.5px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide bg-violet-50/70 dark:bg-violet-900/20 border-b border-gray-200 dark:border-gray-700">
        <span className="flex-1">{t("invoiceModal.tax.description")}</span>
        {showQty && <span className="w-10 text-right">{t("invoiceModal.tax.qty")}</span>}
        <span className="w-32 text-right">{t("invoiceModal.tax.amount")}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 text-[12px]">
          <span className="flex-1 text-gray-800 dark:text-gray-200">{r.description}</span>
          {showQty && <span className="w-10 text-right text-gray-600 dark:text-gray-300">{r.qty}</span>}
          <span className="w-32 text-right font-medium text-gray-900 dark:text-gray-50">{r.amount}</span>
        </div>
      ))}
    </div>
  );
}
