"use client";

/**
 * /app/[locale]/[country]/profile/components/shared/InvoiceDocument.jsx
 *
 * The invoice documents behind a booking's "Invoice" action, as 2 tabs:
 * a customer-facing Invoice, and a Tax Invoice tab.
 *
 * PRICING MODEL: `booking.amountINR` is a PRE-TAX base price for the
 * venue/farmstay charge — GST is added ON TOP of it, never backed out of
 * it. `MOCK_DISCOUNT_INR` reduces that base BEFORE any GST is calculated,
 * and — unlike the feature's first iteration — that discounted base is
 * what EVERY document uses, including the Tax Invoice tab: "Net
 * {category} Price" on a Tax Invoice document is always
 * `amountINR - MOCK_DISCOUNT_INR`, and every CGST/SGST/IGST figure is
 * computed off that same discounted figure. The convenience fee never has
 * a discount applied to it.
 *
 * The Tax Invoice tab's shape depends on whether the vendor itself is GST
 * registered (`booking.gstRegistered`, see mockProfileData.js's
 * MOCK_BOOKINGS header comment for the full demo matrix):
 *   - registered   → TWO real tax invoice cards stacked: "Tax Invoice -
 *     {vendor}" (for the venue/farmstay charge) and "Tax Invoice -
 *     venuebook.in" (for the convenience fee) — two different suppliers,
 *     two different GSTINs, as real Indian marketplace invoicing requires. Neither card
 *     carries its own running total; a shared, header-less
 *     `TotalsFooterCard` below both cards carries the combined
 *     Gross Invoice Value / Points Redeemed / Total Amount Paid figures.
 *   - not registered → an unregistered vendor legally cannot issue a GST
 *     tax invoice, so venuebook.in issues ONE combined "Tax Invoice" card
 *     covering both the venue/farmstay charge and the convenience fee
 *     back-to-back with no heading between them (buildCombinedModel),
 *     with the shared totals embedded in that same card. Every
 *     intra-/inter-state (CGST+SGST vs IGST) determination in that single
 *     document uses venuebook.in's own state against the booking's
 *     customerState — there's no vendor place-of-supply to compare
 *     against once the vendor isn't the one issuing tax.
 *
 * The Invoice tab similarly branches on `gstRegistered`: a registered
 * vendor's card shows TWO labeled sub-sections in one card — "Invoice A -
 * {vendor}" (the venue/farmstay charge, ending in an explicit "Total
 * {category} Value") and "Invoice B - VB" (the convenience fee, ending in
 * "Total Platform Fee") — while an unregistered vendor's card stays a
 * single flat, unheaded list using slightly different row labels (e.g. an
 * explicit "Net {category} Value" row that the registered variant leaves
 * unlabeled). Both variants end with the same shared totals block: venues
 * never redeem loyalty points on a booking (product rule), so they get a
 * single bold "Total Amount Paid"; farmstays show a "Gross Invoice Value"
 * subtotal, the loyalty redemption as its own deduction, then a final
 * bold "Total Amount Paid".
 *
 * IGST consolidation: everywhere a Tax Invoice document would otherwise
 * show a two-line CGST(@9%) + SGST(@9%) breakdown, an inter-state booking
 * collapses that into a single indented "IGST (@ 18%)" line instead
 * (`gstBreakdownRows` below) — never both. This only applies inside Tax
 * Invoice blocks; the Invoice (Main) tab never splits CGST/SGST at all,
 * it always shows one flat GST line regardless of intra-/inter-state.
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
 * (check-in/out vs. a single event date/time) all read the booking's
 * actual category via `tCat`, so a studio/workspace/rental/experience
 * booking gets correctly-worded content instead of being force-fit into
 * "Venue" or "Farmstay" wording. The one deliberate venue/farmstay split
 * left is the shared totals block described above.
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
import { VENUEBOOK_GSTIN, VENUEBOOK_STATE, deriveInvoiceNumbers } from "../../data/mockProfileData";
import { computeBookingTotals } from "../../data/bookingMath";
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

/**
 * A CGST(@9%)+SGST(@9%) breakdown for an intra-state supply, collapsed to
 * a single IGST(@18%) line for an inter-state one — the one piece of tax
 * math every Tax Invoice block shares, so it lives in one place instead
 * of being duplicated across buildVendorModel/buildFeeModel/
 * buildCombinedModel.
 */
function gstBreakdownRows({ isIntraState, base, t }) {
  if (isIntraState) {
    return [
      { label: t("invoiceModal.tax.cgst"), value: formatINR2dp(base * 0.09), indent: true },
      { label: t("invoiceModal.tax.sgst"), value: formatINR2dp(base * 0.09), indent: true },
    ];
  }
  return [{ label: t("invoiceModal.tax.igst"), value: formatINR2dp(base * 0.18), indent: true }];
}

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

  // All GST/discount/loyalty math lives in the shared bookingMath.js
  // helper now — ManageBookingView.jsx's Payment Status / Payment tab /
  // Cancellation refund calculator needs the EXACT same "Total Amount
  // Paid" figure this tab shows, not a second, disconnected computation.
  const {
    isIntraStateVendor,
    isIntraStateVB,
    venuePrice,
    discount,
    netVenueValue,
    gstOnVenue,
    grossTaxableVenuePrice,
    feeBase,
    gstOnFee,
    grossTaxableFeePrice,
    loyaltyDiscount,
    totalBeforeLoyalty,
    totalAmountPaid,
  } = computeBookingTotals(b);
  const finalRows = isFarmstay
    ? [
        { label: t("invoiceModal.main.grossInvoiceValue"), value: formatINR2dp(totalBeforeLoyalty), bold: true },
        { label: t("invoiceModal.main.pointsRedeemed"), value: `-${formatINR2dp(loyaltyDiscount)}` },
        { label: t("invoiceModal.main.totalAmountPaid"), value: formatINR2dp(totalAmountPaid), bold: true, large: true },
      ]
    : [
        {
          label: t("invoiceModal.main.totalAmountPaid"),
          value: formatINR2dp(totalBeforeLoyalty),
          bold: true,
          large: true,
        },
      ];

  const buildMainModel = () => {
    const venueRowsRegistered = [
      { label: t("invoiceModal.main.venuePriceLabel", { category: categoryLabel }), value: formatINR2dp(venuePrice) },
      { label: t("invoiceModal.main.discount"), value: `-${formatINR2dp(discount)}` },
      { label: "", value: formatINR2dp(netVenueValue) },
      { label: t("invoiceModal.main.gst18Label"), value: formatINR2dp(gstOnVenue) },
      {
        label: t("invoiceModal.main.totalCategoryValueLabel", { category: categoryLabel }),
        value: formatINR2dp(grossTaxableVenuePrice),
        bold: true,
      },
    ];
    const feeRowsRegistered = [
      { label: t("invoiceModal.main.feesPluralLabel"), value: formatINR2dp(feeBase) },
      { label: t("invoiceModal.main.gstPlainLabel"), value: formatINR2dp(gstOnFee) },
      { label: t("invoiceModal.main.totalPlatformFeeLabel"), value: formatINR2dp(grossTaxableFeePrice), bold: true },
    ];
    const venueRowsUnregistered = [
      { label: t("invoiceModal.main.venuePriceLabel", { category: categoryLabel }), value: formatINR2dp(venuePrice) },
      { label: t("invoiceModal.main.discount"), value: `-${formatINR2dp(discount)}` },
      {
        label: t("invoiceModal.main.netVenueValueLabel", { category: categoryLabel }),
        value: formatINR2dp(netVenueValue),
      },
      {
        label: t("invoiceModal.main.gstOnVenueLabel", { category: categoryLabel }),
        value: formatINR2dp(gstOnVenue),
      },
      { label: "", value: formatINR2dp(grossTaxableVenuePrice), bold: true },
    ];
    const feeRowsUnregistered = [
      { label: t("invoiceModal.main.convenienceFee"), value: formatINR2dp(feeBase) },
      { label: t("invoiceModal.main.gstOnFee"), value: formatINR2dp(gstOnFee) },
      { label: "", value: formatINR2dp(grossTaxableFeePrice), bold: true },
    ];

    const blocks = isRegistered
      ? [
          { heading: t("invoiceModal.main.invoiceALabel", { vendor: b.vendorName }), rows: venueRowsRegistered },
          { heading: t("invoiceModal.main.invoiceBLabel"), rows: feeRowsRegistered },
        ]
      : [{ heading: null, rows: [...venueRowsUnregistered, ...feeRowsUnregistered] }];

    return {
      docType: t("invoiceModal.badgeInvoice"),
      title: t("invoiceModal.main.docTitle"),
      fieldGroups: [
        {
          heading: t("invoiceModal.main.groupInvoice"),
          Icon: FileText,
          fields: [
            { label: t("invoiceModal.main.invoiceDate"), value: formatDDMonYYYY(invoiceDateObj) },
            { label: t("invoiceModal.main.invoiceNo"), value: mainInvoiceNo },
            { label: t("invoiceModal.main.bookingId"), value: b.bookingId },
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
              ? {
                  label: t("invoiceModal.main.checkIn"),
                  value: b.checkInTime ? `${formatDDMonYYYY(eventDate)} · ${b.checkInTime}` : formatDDMonYYYY(eventDate),
                }
              : {
                  label: t("invoiceModal.main.eventDateTime"),
                  value: b.shiftLabel
                    ? `${formatDDMonYYYY(eventDate)} · ${b.shiftLabel}${b.shiftTime ? ` (${b.shiftTime})` : ""}`
                    : formatDDMonYYYY(eventDate),
                },
            ...(isStayBased
              ? [
                  {
                    label: t("invoiceModal.main.checkOut"),
                    value: b.checkOutTime
                      ? `${formatDDMonYYYY(checkOutObj)} · ${b.checkOutTime}`
                      : formatDDMonYYYY(checkOutObj),
                  },
                ]
              : []),
          ],
        },
        {
          heading: t("invoiceModal.main.groupPayment"),
          Icon: CreditCard,
          fields: [
            { label: t("invoiceModal.main.paymentStatus"), value: t(`payment.${b.paymentStatus}`) },
            { label: t("invoiceModal.main.paymentMode"), value: b.paymentMode },
            { label: t("invoiceModal.main.transactionId"), value: transactionId },
            ...(b.paymentStatus === "partial"
              ? [{ label: t("invoiceModal.main.remainingAmount"), value: formatINR2dp(totalAmountPaid / 2) }]
              : []),
          ],
        },
      ],
      blocks,
      finalRows,
      footer: t("invoiceModal.main.footerNote"),
    };
  };

  // Registered scenario only — the vendor's own tax invoice for the
  // venue/farmstay charge. No running total of its own: the combined
  // total lives in the shared TotalsFooterCard below both stacked cards.
  const buildVendorModel = () => ({
    docType: t("invoiceModal.tabs.venue"),
    title: `${t("invoiceModal.tabs.tax")} - ${b.vendorName}`,
    fields: [
      { label: t("invoiceModal.main.bookingId"), value: b.bookingId },
      { label: t("invoiceModal.tax.invoiceNo"), value: vendorInvoiceNo },
      { label: t("invoiceModal.tax.invoiceDate"), value: formatLongDate(invoiceDateObj) },
      { label: t("invoiceModal.tax.gstin"), value: b.vendorGSTIN },
      { label: t("invoiceModal.tax.placeOfSupply"), value: b.placeOfSupply },
    ],
    blocks: [
      {
        heading: null,
        rows: [
          {
            label: t("invoiceModal.tax.netVenuePriceLabel", { category: categoryLabel }),
            value: formatINR2dp(netVenueValue),
          },
          { label: t("invoiceModal.tax.gstHeaderLabel"), value: null },
          ...gstBreakdownRows({ isIntraState: isIntraStateVendor, base: netVenueValue, t }),
          {
            label: t("invoiceModal.tax.grossTaxableVenueLabel", { category: categoryLabel }),
            value: formatINR2dp(grossTaxableVenuePrice),
            bold: true,
          },
        ],
      },
    ],
    finalRows: [],
    footer: t("invoiceModal.tax.venueFooter", { vendor: b.vendorName }),
  });

  // Registered scenario only — venuebook.in's own tax invoice for the
  // convenience fee (the vendor's charge is taxed separately above). No
  // running total of its own, same reason as buildVendorModel.
  const buildFeeModel = () => ({
    docType: t("invoiceModal.tabs.fee"),
    title: `${t("invoiceModal.tabs.tax")} - venuebook.in`,
    fields: [
      { label: t("invoiceModal.main.bookingId"), value: b.bookingId },
      { label: t("invoiceModal.tax.invoiceNo"), value: feeInvoiceNo },
      { label: t("invoiceModal.tax.invoiceDate"), value: formatLongDate(invoiceDateObj) },
      { label: t("invoiceModal.tax.gstin"), value: VENUEBOOK_GSTIN },
      { label: t("invoiceModal.tax.placeOfSupply"), value: VENUEBOOK_STATE },
    ],
    blocks: [
      {
        heading: null,
        rows: [
          { label: t("invoiceModal.tax.netFeeLabel"), value: formatINR2dp(feeBase) },
          { label: t("invoiceModal.tax.gstHeaderLabel"), value: null },
          ...gstBreakdownRows({ isIntraState: isIntraStateVB, base: feeBase, t }),
          {
            label: t("invoiceModal.tax.grossTaxableFeeLabel"),
            value: formatINR2dp(grossTaxableFeePrice),
            bold: true,
          },
        ],
      },
    ],
    finalRows: [],
    footer: t("invoiceModal.tax.feeFooter"),
  });

  // Unregistered scenario only — an unregistered vendor can't issue GST
  // tax, so venuebook.in issues ONE tax invoice covering both the
  // venue/farmstay charge (first, per product spec) and the convenience
  // fee, back-to-back with no heading between them, one supplier, one
  // intra-/inter-state determination (isIntraStateVB) for both — with the
  // shared totals embedded in this same card.
  const buildCombinedModel = () => ({
    docType: t("invoiceModal.tabs.tax"),
    title: `${t("invoiceModal.tabs.tax")} - venuebook.in`,
    fields: [
      { label: t("invoiceModal.main.bookingId"), value: b.bookingId },
      { label: t("invoiceModal.tax.invoiceNo"), value: feeInvoiceNo },
      { label: t("invoiceModal.tax.invoiceDate"), value: formatLongDate(invoiceDateObj) },
      { label: t("invoiceModal.tax.gstin"), value: VENUEBOOK_GSTIN },
      { label: t("invoiceModal.tax.placeOfSupply"), value: VENUEBOOK_STATE },
    ],
    blocks: [
      {
        heading: null,
        rows: [
          {
            label: t("invoiceModal.tax.netVenuePriceLabel", { category: categoryLabel }),
            value: formatINR2dp(netVenueValue),
          },
          { label: t("invoiceModal.tax.gstHeaderLabel"), value: null },
          ...gstBreakdownRows({ isIntraState: isIntraStateVB, base: netVenueValue, t }),
          {
            label: t("invoiceModal.tax.grossTaxableVenueLabel", { category: categoryLabel }),
            value: formatINR2dp(grossTaxableVenuePrice),
            bold: true,
          },
          { label: t("invoiceModal.tax.netFeeLabel"), value: formatINR2dp(feeBase) },
          { label: t("invoiceModal.tax.gstHeaderLabel"), value: null },
          ...gstBreakdownRows({ isIntraState: isIntraStateVB, base: feeBase, t }),
          {
            label: t("invoiceModal.tax.grossTaxableFeeLabel"),
            value: formatINR2dp(grossTaxableFeePrice),
            bold: true,
          },
        ],
      },
    ],
    finalRows,
    footer: t("invoiceModal.tax.combinedFooter", { vendor: b.vendorName, category: categoryLabel }),
  });

  // "tax" is either two real documents (registered vendor, plus a shared
  // TotalsFooterCard appended below both) or one combined document
  // (unregistered vendor, totals embedded) stacked under one tab; "main"
  // is always just the one.
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
  if (tab === "tax" && isRegistered) {
    docCards.push(<TotalsFooterCard key="totals-footer" rows={finalRows} t={t} />);
  }

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
      <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <img src={lightLogo.src ?? lightLogo} alt="venuebook.in" className="h-5 w-auto dark:hidden" />
        <img src={darkLogo.src ?? darkLogo} alt="venuebook.in" className="h-5 w-auto hidden dark:block" />
      </div>
      <div className="px-4 pt-3 pb-3.5 bg-gray-50/60 dark:bg-gray-800/30">
        <p className="text-[13px] font-bold text-gray-900 dark:text-gray-50">{model.title}</p>
        {model.subtitle && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{model.subtitle}</p>}
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
          model.fields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 p-3.5">
              {model.fields.map((f, i) => (
                <Field key={i} label={f.label} value={f.value} />
              ))}
            </div>
          )
        )}

        {/* Each block is its own bordered rows box — a Main Invoice with
            two blocks (registered vendor's charge + VB's fee) simply
            stacks two of these with no heading between them. Rows render
            in array order — `bold` only changes a row's styling (a
            top-bordered, bold "subtotal/total" bar), it does NOT bucket
            bold rows to the end, which is what lets a bold subtotal sit
            in the MIDDLE of a block's row list. */}
        {model.blocks?.map((block, bi) => (
          <div key={bi} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <RowsHeader t={t} />
            {block.rows.map((r, ri) => (
              <SummaryRow key={ri} {...r} />
            ))}
          </div>
        ))}

        {/* Shared Gross Invoice Value / Points Redeemed / Total Amount
            Paid totals — only rendered here when the model embeds them
            (Main Invoice, and the unregistered Combined Tax Invoice); the
            registered Tax Invoice's two per-supplier cards leave this
            empty and rely on the standalone TotalsFooterCard instead. */}
        {model.finalRows && model.finalRows.length > 0 && (
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <RowsHeader t={t} />
            {model.finalRows.map((r, ri) => (
              <SummaryRow key={ri} {...r} />
            ))}
          </div>
        )}

        {model.footer && <p className="text-[10.5px] text-gray-400 dark:text-gray-500 italic pt-1">{model.footer}</p>}
      </div>
    </div>
  );
}

/**
 * Standalone card (no logo/title header, unlike DocCard) carrying the
 * shared Gross Invoice Value / Points Redeemed / Total Amount Paid rows —
 * shown below the registered Tax Invoice tab's two stacked per-supplier
 * cards, since neither of those individually represents "what the
 * customer paid in total".
 */
function TotalsFooterCard({ rows, t }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <RowsHeader t={t} />
      {rows.map((r, i) => (
        <SummaryRow key={i} {...r} />
      ))}
    </div>
  );
}

/**
 * Column header ("DESCRIPTION" / "AMOUNT") shown above every rows box —
 * blocks, finalRows, and TotalsFooterCard alike — so every row's label
 * and amount line up under a labeled column, matching the original
 * line-item table's header styling.
 */
function RowsHeader({ t }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-[10.5px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide bg-violet-50/70 dark:bg-violet-900/20 border-b border-gray-200 dark:border-gray-700">
      <span className="flex-1">{t("invoiceModal.tax.description")}</span>
      <span className="w-32 text-right shrink-0">{t("invoiceModal.main.amount")}</span>
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

/**
 * A single row inside a `blocks`/`finalRows` box. Three shapes:
 *   - `value === null` → header-only row (e.g. "(+)GST" introducing an
 *     indented CGST/SGST/IGST breakdown right below it) — a small muted
 *     label with no amount.
 *   - `bold` → a top-bordered, bold subtotal/total bar.
 *   - otherwise → a plain label/value line; `indent` pushes it in
 *     (pl-7) for the CGST/SGST/IGST lines nested under a "(+)GST" header.
 */
function SummaryRow({ label, value, bold, indent, large }) {
  if (value == null) {
    return (
      <div className="px-3 pt-2 pb-0.5">
        <span className="text-[10.5px] font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    );
  }
  if (bold) {
    return (
      <div
        className={`flex items-center gap-2 px-3 border-t border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-gray-50 ${
          large ? "py-3.5 text-[16px]" : "py-2.5 text-[13px]"
        }`}
      >
        <span className="flex-1">{label}</span>
        <span className="w-32 text-right shrink-0">{value}</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 py-1.5 px-3 text-[12px] ${indent ? "pl-7" : ""}`}>
      <span className="flex-1 text-gray-600 dark:text-gray-300">{label}</span>
      <span className="w-32 text-right shrink-0 font-medium text-gray-900 dark:text-gray-50">{value}</span>
    </div>
  );
}
