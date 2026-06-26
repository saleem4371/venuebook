/**
 * /app/[locale]/[country]/checkout/[category]/[propertyId]/success/page.jsx
 *
 * Thin server-side route wrapper for the post-payment success page.
 */

import SuccessClient from "./components/SuccessClient";

export default async function SuccessPage({ params }) {
  const { locale, country, category, propertyId } = await params;
  return (
    <SuccessClient
      locale={locale}
      country={country}
      category={category}
      propertyId={propertyId}
    />
  );
}
