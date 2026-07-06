"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Wallet, ShieldCheck, MessageSquareText } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  ComparisonSection, FieldRow, ChipGroupCard,
  DifferenceToggle, countIdenticalFields,
} from "./shared/Primitives";

/**
 * WorkspaceComparisonExperience — comparison attributes specific to the
 * Workspaces category: Seats, Meeting Rooms, Internet, Parking, Printer,
 * Pantry, Cabin, Operating Hours, Pricing, Rating. Kept entirely separate
 * from Venue/Farmstay/Studio/Rental wording and sections.
 */
export default function WorkspaceComparisonExperience({ properties }) {
  const t = useTranslations("compare.workspace");
  const { format } = useCurrency();
  const [showSimilarities, setShowSimilarities] = useState(false);

  /* ── Overview ─────────────────────────────────────────────────────── */
  const overviewFields = [
    { key: "seats", label: t("overview.seats"), values: properties.map((p) => p.seats), direction: "higher", renderValue: (v) => t("seatsValue", { count: v }), bestLabel: t("badges.mostSeats") },
    { key: "meetingRooms", label: t("overview.meetingRooms"), values: properties.map((p) => p.meetingRooms), direction: "higher", renderValue: (v) => t("roomsValue", { count: v }) },
    { key: "rating", label: t("overview.rating"), values: properties.map((p) => p.reviews.rating), direction: "higher", renderValue: (v) => Number(v).toFixed(1), bestLabel: t("badges.topRated") },
  ];

  /* ── Pricing & Hours ──────────────────────────────────────────────── */
  const pricingFields = [
    { key: "rate", label: t("pricing.rate"), values: properties.map((p) => p.pricing.rate), direction: "lower", renderValue: (v) => format(v), bestLabel: t("badges.lowestPrice") },
    { key: "pricingType", label: t("pricing.pricingType"), values: properties.map((p) => p.pricing.pricingType), renderValue: (v) => v },
    { key: "operatingHours", label: t("pricing.operatingHours"), values: properties.map((p) => p.operatingHours), renderValue: (v) => v },
    { key: "internet", label: t("pricing.internet"), values: properties.map((p) => p.internet), renderValue: (v) => v },
  ];

  /* ── Facilities ───────────────────────────────────────────────────── */
  const facilityBoolFields = ["parking", "printer", "pantry", "cabin"];

  const hiddenCount = countIdenticalFields([...pricingFields]);

  return (
    <>
      {/* ── Overview ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.overview")} icon={<Building2 size={18} />} defaultOpen>
        {overviewFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {hiddenCount > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <DifferenceToggle showSimilarities={showSimilarities} onToggle={() => setShowSimilarities((v) => !v)} hiddenCount={hiddenCount} />
        </div>
      )}

      {/* ── Pricing & Hours ──────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.pricing")} icon={<Wallet size={18} />}>
        {pricingFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Facilities ───────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.facilities")} icon={<ShieldCheck size={18} />}>
        <ChipGroupCard
          label={t("sections.facilities")}
          properties={properties}
          getItems={(p) => Object.fromEntries(facilityBoolFields.map((k) => [t(`facilities.${k}`), p[k]]))}
        />
        <ChipGroupCard
          label={t("amenities.title")}
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
