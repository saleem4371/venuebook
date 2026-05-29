"use client";

/**
 * PriceDisplay — formats a price stored in INR using the user's selected currency.
 * All symbols resolved from lib/currency config — no hardcoded symbols.
 *
 * Usage:
 *   <PriceDisplay amount={5000} />
 *   <PriceDisplay amount={item.item_price} className="font-bold" />
 */

import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCIES }  from "@/lib/currency";

/** Symbol to render before mount (SSR-safe). Sourced from config, not hardcoded. */
const DEFAULT_SYMBOL = CURRENCIES?.INR?.symbol ?? "";

export default function PriceDisplay({ amount, className = "", style }) {
  const { format, mounted } = useCurrency();

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) return null;

  return (
    <span className={className} style={style}>
      {format(Number(amount) || 0)}
    </span>
  );
}

/**
 * usePriceCurrencySymbol — returns the symbol for the current currency.
 * Used for input prefixes (price fields always accept INR on this dashboard).
 * Falls back to the config-defined INR symbol before hydration.
 */
export function usePriceCurrencySymbol() {
  const { currencyConfig, mounted } = useCurrency();
  return mounted ? (currencyConfig?.symbol ?? DEFAULT_SYMBOL) : DEFAULT_SYMBOL;
}
