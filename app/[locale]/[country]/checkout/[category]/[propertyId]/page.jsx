/**
 * /app/[locale]/[country]/checkout/[category]/[propertyId]/page.jsx
 *
 * Thin server-side route wrapper for the checkout page.
 * All interactivity lives inside CheckoutClient (client component).
 */

import CheckoutClient from "./components/CheckoutClient";

export default async function CheckoutPage({ params }) {
  const { locale, country, category, propertyId } = await params;
  return (
    <CheckoutClient
      locale={locale}
      country={country}
      category={category}
      propertyId={propertyId}
    />
  );
}
