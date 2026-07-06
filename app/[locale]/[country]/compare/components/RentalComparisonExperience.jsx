"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Car, Clock, ShieldCheck, MessageSquareText } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  ComparisonSection, FieldRow, ChipGroupCard,
  DifferenceToggle, countIdenticalFields,
} from "./shared/Primitives";

/**
 * RentalComparisonExperience — category-specific rental attributes:
 * rental type, pricing, guest/room capacity, stay policy details and
 * amenities. Kept entirely separate from Venue/Farmstay/Studio/Workspace
 * wording and sections.
 */
export default function RentalComparisonExperience({ properties }) {
  const t = useTranslations("compare.rental");
  const { format } = useCurrency();
  const [showSimilarities, setShowSimilarities] = useState(false);

  const boolText = (v) => (v ? t("yes") : t("no"));

  /* ── Overview ─────────────────────────────────────────────────────── */
  const overviewFields = [
    { key: "rentalType", label: t("overview.rentalType"), values: properties.map((p) => p.rentalType), renderValue: (v) => v },
    { key: "price", label: t("overview.price"), values: properties.map((p) => p.minPrice), direction: "lower", renderValue: (v) => (v != null ? format(v) : "—"), bestLabel: t("badges.lowestPrice") },
    { key: "pricingType", label: t("overview.pricingType"), values: properties.map((p) => p.pricingType), renderValue: (v) => v },
    { key: "rating", label: t("overview.rating"), values: properties.map((p) => p.reviews.rating), direction: "higher", renderValue: (v) => Number(v).toFixed(1), bestLabel: t("badges.topRated") },
  ];

  /* ── Capacity ─────────────────────────────────────────────────────── */
  const capacityFields = [
    { key: "maxGuests", label: t("capacity.maxGuests"), values: properties.map((p) => p.maxGuests), direction: "higher", renderValue: (v) => t("guestsValue", { count: v }), bestLabel: t("badges.mostGuests") },
    { key: "bedrooms", label: t("capacity.bedrooms"), values: properties.map((p) => p.bedrooms), direction: "higher", renderValue: (v) => t("bedroomsValue", { count: v }) },
    { key: "bathrooms", label: t("capacity.bathrooms"), values: properties.map((p) => p.bathrooms), renderValue: (v) => t("bathroomsValue", { count: v }) },
  ];

  /* ── Stay Policy ──────────────────────────────────────────────────── */
  const policyFields = [
    { key: "checkIn", label: t("policy.checkIn"), values: properties.map((p) => p.checkIn), renderValue: (v) => v },
    { key: "checkOut", label: t("policy.checkOut"), values: properties.map((p) => p.checkOut), renderValue: (v) => v },
    { key: "petFriendly", label: t("policy.petFriendly"), values: properties.map((p) => p.petFriendly), renderValue: boolText },
    { key: "cancellation", label: t("policy.cancellation"), values: properties.map((p) => p.cancellation), renderValue: (v) => v },
  ];

  const hiddenCount = countIdenticalFields([...capacityFields, ...policyFields]);

  return (
    <>
      {/* ── Overview ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.overview")} icon={<Car size={18} />} defaultOpen>
        {overviewFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {hiddenCount > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <DifferenceToggle showSimilarities={showSimilarities} onToggle={() => setShowSimilarities((v) => !v)} hiddenCount={hiddenCount} />
        </div>
      )}

      {/* ── Capacity ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.capacity")} icon={<Car size={18} />}>
        {capacityFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Stay Policy ──────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.policy")} icon={<Clock size={18} />}>
        {policyFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Amenities ────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.amenities")} icon={<ShieldCheck size={18} />}>
        <ChipGroupCard
          label={t("sections.amenities")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.amenities).map(([k, v]) => [t(`amenityItems.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.reviews")} icon={<MessageSquareText size={18} />}>
        <FieldRow
          field={{
            key: "reviewCount", label: t("reviews.reviewCount"),
            values: properties.map((p) => p.reviews.reviewCount), direction: "higher",
            renderValue: (v) => t("reviewsValue", { count: v }),
          }}
          properties={properties} showSimilarities
        />
      </ComparisonSection>
    </>
  );
}
