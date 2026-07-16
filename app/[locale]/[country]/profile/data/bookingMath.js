/**
 * /app/[locale]/[country]/profile/data/bookingMath.js
 *
 * The one place that computes "how much does this booking actually cost,
 * in total" — extracted out of InvoiceDocument.jsx so ManageBookingView.jsx
 * (the Manage Booking tab's Payment Status / Payment tab / Cancellation
 * refund calculator) can show the EXACT same "Total Amount Paid" and
 * "Remaining Balance" figures as the Invoice tab, instead of quietly
 * re-deriving a second, disconnected number — the same principle this
 * codebase already applies to wallet points, spend, and unread message
 * counts (see mockProfileData.js / MessagesNavCard.jsx header comments).
 *
 * PRICING MODEL (unchanged from InvoiceDocument.jsx): `booking.amountINR`
 * is a PRE-TAX base price for the venue/farmstay charge — GST is added on
 * top, never backed out of it. `MOCK_DISCOUNT_INR` reduces that base
 * BEFORE any GST is calculated. The convenience fee is a flat amount with
 * GST added on top, never discounted. Loyalty points are only ever
 * redeemed on a farmstay booking (product rule) — venues always show a
 * single "Total Amount Paid" with no loyalty deduction.
 */

import {
  MOCK_CONVENIENCE_FEE_INR,
  MOCK_DISCOUNT_INR,
  MOCK_VB_LOYALTY_DISCOUNT_INR,
  VENUEBOOK_STATE,
} from "./mockProfileData";

/**
 * @param {object} booking - a MOCK_BOOKINGS entry
 * @returns {{
 *   isIntraStateVendor: boolean,
 *   isIntraStateVB: boolean,
 *   venuePrice: number,
 *   discount: number,
 *   netVenueValue: number,
 *   gstOnVenue: number,
 *   grossTaxableVenuePrice: number,
 *   feeBase: number,
 *   gstOnFee: number,
 *   grossTaxableFeePrice: number,
 *   loyaltyDiscount: number,
 *   totalBeforeLoyalty: number,
 *   totalAmountPaid: number,
 * }}
 */
export function computeBookingTotals(b) {
  const isFarmstay = b.category === "farmstays";

  // CGST+SGST only applies when the supplier and the customer are in the
  // SAME state; a different state means it's an inter-state supply and
  // IGST applies instead — real GST law. `isIntraStateVendor` only ever
  // matters when the vendor itself is the supplier issuing tax;
  // `isIntraStateVB` covers every document venuebook.in itself issues as
  // supplier (its own Fee invoice, or the single Combined invoice when the
  // vendor isn't GST-registered).
  const isIntraStateVendor = b.placeOfSupply === b.customerState;
  const isIntraStateVB = VENUEBOOK_STATE === b.customerState;

  const venuePrice = b.amountINR;
  const discount = MOCK_DISCOUNT_INR;
  const netVenueValue = Math.max(venuePrice - discount, 0);
  const gstOnVenue = netVenueValue * 0.18;
  const grossTaxableVenuePrice = netVenueValue + gstOnVenue;

  const feeBase = MOCK_CONVENIENCE_FEE_INR;
  const gstOnFee = feeBase * 0.18;
  const grossTaxableFeePrice = feeBase + gstOnFee;

  const loyaltyDiscount = MOCK_VB_LOYALTY_DISCOUNT_INR;

  const totalBeforeLoyalty = grossTaxableVenuePrice + grossTaxableFeePrice;
  const totalAmountPaid = isFarmstay ? totalBeforeLoyalty - loyaltyDiscount : totalBeforeLoyalty;

  return {
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
  };
}
