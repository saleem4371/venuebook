/**
 * /lib/currency.js
 *
 * CURRENCY SYSTEM
 * ───────────────
 * All prices are stored in INR (base currency).
 * Conversion happens ONLY at display time.
 * Uses Intl.NumberFormat — no hardcoded symbols anywhere.
 */

/** Supported currencies with their display metadata. */
export const CURRENCIES = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    displayLocale: "en-IN",
    flag: "/flags/in.svg",
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    displayLocale: "en-AE",
    flag: "/flags/ae.svg",
  },
};

/**
 * Mock exchange rates — base currency is INR.
 * To update rates, change only this object.
 * Production: replace with a live-rates API call.
 */
const EXCHANGE_RATES = {
  INR: 1,
  AED: 0.044,
};

/**
 * Convert an amount stored in INR to the target currency.
 *
 * @param {number} amountInINR
 * @param {string} targetCurrency  e.g. "AED"
 * @returns {number}
 */
export function convertCurrency(amountInINR, targetCurrency = "INR") {
  const rate = EXCHANGE_RATES[targetCurrency] ?? 1;
  return amountInINR * rate;
}

/**
 * Format a price for display.
 * Amounts are always provided in INR; conversion is applied internally.
 *
 * @param {number} amountInINR   Base price in Indian Rupees
 * @param {string} currency      Target currency code, e.g. "AED"
 * @param {string} [locale]      BCP 47 locale override (defaults to currency displayLocale)
 * @returns {string}             Formatted price string, e.g. "₹5,000" or "AED 220.00"
 */
export function formatPrice(amountInINR, currency = "INR", locale) {
  const converted = convertCurrency(amountInINR, currency);
  const currencyMeta = CURRENCIES[currency] || CURRENCIES.INR;
  const displayLocale = locale || currencyMeta.displayLocale;

  return new Intl.NumberFormat(displayLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
    minimumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(converted);
}

/**
 * Return the config object for a currency code.
 * Falls back to INR if not found.
 *
 * @param {string} currencyCode
 * @returns {object}
 */
export function getCurrencyConfig(currencyCode) {
  return CURRENCIES[currencyCode] || CURRENCIES.INR;
}

/**
 * Return an array of all supported currencies.
 *
 * @returns {object[]}
 */
export function getAllCurrencies() {
  return Object.values(CURRENCIES);
}
