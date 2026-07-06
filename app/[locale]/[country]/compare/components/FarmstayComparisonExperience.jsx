"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Home, Clock, BedDouble, TentTree, Wifi, UtensilsCrossed,
  MapPinned, ShieldCheck, Image as ImageIcon, MessageSquareText,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  ComparisonSection, FieldRow, ChipGroupCard,
  DifferenceToggle, countIdenticalFields,
} from "./shared/Primitives";

export default function FarmstayComparisonExperience({ properties, locale, country }) {
  const t = useTranslations("compare.farmstay");
  const { format } = useCurrency();
  const [showSimilarities, setShowSimilarities] = useState(false);

  const boolText = (v) => (v ? t("yes") : t("no"));

  /* ── Overview highlights (beyond what the cards already show) ────────── */
  const overviewFields = [
    { key: "startingPrice", label: t("overview.startingPrice"), values: properties.map((p) => p.minPrice), direction: "lower", renderValue: (v) => (v != null ? format(v) : "—"), bestLabel: t("badges.lowestPrice") },
    { key: "guests", label: t("overview.guests"), values: properties.map((p) => p.maxGuests), direction: "higher", renderValue: (v) => t("guestsValue", { count: v }) },
    { key: "bedrooms", label: t("overview.bedrooms"), values: properties.map((p) => p.accommodation.bedrooms), direction: "higher", renderValue: (v) => t("bedroomsValue", { count: v }), bestLabel: t("badges.mostBedrooms") },
    { key: "bathrooms", label: t("overview.bathrooms"), values: properties.map((p) => p.bathrooms), renderValue: (v) => t("bathroomsValue", { count: v }) },
    { key: "acres", label: t("overview.acres"), values: properties.map((p) => p.acres), direction: "higher", renderValue: (v) => t("acresValue", { count: v }), bestLabel: t("badges.largestEstate") },
    { key: "entireOrPrivate", label: t("overview.entireOrPrivate"), values: properties.map((p) => p.entireOrPrivateRoom), renderValue: (v) => v },
  ];

  /* ── Stay Details ─────────────────────────────────────────────────────── */
  const stayFields = [
    { key: "checkIn", label: t("stay.checkIn"), values: properties.map((p) => p.stayDetails.checkIn), renderValue: (v) => v },
    { key: "checkOut", label: t("stay.checkOut"), values: properties.map((p) => p.stayDetails.checkOut), renderValue: (v) => v },
    { key: "mealsIncluded", label: t("stay.mealsIncluded"), values: properties.map((p) => p.stayDetails.mealsIncluded), renderValue: (v) => v },
    { key: "caretaker", label: t("stay.caretaker"), values: properties.map((p) => p.stayDetails.caretaker), renderValue: boolText },
    { key: "petFriendly", label: t("stay.petFriendly"), values: properties.map((p) => p.stayDetails.petFriendly), renderValue: boolText },
    { key: "smoking", label: t("stay.smoking"), values: properties.map((p) => p.stayDetails.smoking), renderValue: (v) => v },
    { key: "familyFriendly", label: t("stay.familyFriendly"), values: properties.map((p) => p.stayDetails.familyFriendly), renderValue: boolText },
    { key: "coupleFriendly", label: t("stay.coupleFriendly"), values: properties.map((p) => p.stayDetails.coupleFriendly), renderValue: boolText },
  ];

  /* ── Accommodation ────────────────────────────────────────────────────── */
  const accommodationBoolFields = ["kitchen", "balcony", "pool", "privatePool", "riverAccess", "lakeView", "garden", "privateLawn", "firePit", "bbq", "parking"];
  const accommodationFields = [
    { key: "bedrooms", label: t("accommodation.bedrooms"), values: properties.map((p) => p.accommodation.bedrooms), direction: "higher", renderValue: (v) => t("bedroomsValue", { count: v }) },
    { key: "beds", label: t("accommodation.beds"), values: properties.map((p) => p.accommodation.beds), direction: "higher", renderValue: (v) => t("bedsValue", { count: v }) },
    { key: "bathrooms", label: t("accommodation.bathrooms"), values: properties.map((p) => p.accommodation.bathrooms), renderValue: (v) => t("bathroomsValue", { count: v }) },
  ];

  /* ── Nearby ───────────────────────────────────────────────────────────── */
  const nearbyFields = Object.keys(properties[0]?.nearby || {}).map((label) => ({
    key: label,
    label: t(`nearby.${label}`),
    values: properties.map((p) => p.nearby[label]),
    direction: "lower",
    renderValue: (v) => (v == null ? t("notApplicable") : t("kmValue", { count: v })),
  }));

  const hiddenCount = countIdenticalFields([...stayFields, ...accommodationFields, ...nearbyFields]);

  return (
    <>
      {/* ── Overview highlights ────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.overview")} icon={<Home size={18} />} defaultOpen>
        {overviewFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* Only rendered when there's actually something to hide — with
          nothing collapsed, the control has nothing useful to do. */}
      {hiddenCount > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <DifferenceToggle showSimilarities={showSimilarities} onToggle={() => setShowSimilarities((v) => !v)} hiddenCount={hiddenCount} />
        </div>
      )}

      {/* ── Stay Details ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.stayDetails")} icon={<Clock size={18} />}>
        {stayFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Accommodation ────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.accommodation")} icon={<BedDouble size={18} />}>
        {accommodationFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
        <ChipGroupCard
          label={t("accommodation.amenities")}
          properties={properties}
          getItems={(p) => Object.fromEntries(accommodationBoolFields.map((k) => [t(`accommodation.${k}`), p.accommodation[k]]))}
        />
      </ComparisonSection>

      {/* ── Activities ───────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.activities")} icon={<TentTree size={18} />}>
        <ChipGroupCard
          label={t("sections.activities")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.activities).map(([k, v]) => [t(`activities.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Comfort ──────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.comfort")} icon={<Wifi size={18} />}>
        <ChipGroupCard
          label={t("sections.comfort")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.comfort).map(([k, v]) => [t(`comfort.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Food ─────────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.food")} icon={<UtensilsCrossed size={18} />}>
        <ChipGroupCard
          label={t("sections.food")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.food).map(([k, v]) => [t(`foodItems.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Nearby ───────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.nearby")} icon={<MapPinned size={18} />}>
        {nearbyFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Policies ─────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.policies")} icon={<ShieldCheck size={18} />}>
        {[
          { key: "pets", label: t("policies.pets"), values: properties.map((p) => p.policies.pets), renderValue: boolText },
          { key: "events", label: t("policies.events"), values: properties.map((p) => p.policies.events), renderValue: boolText },
          { key: "visitors", label: t("policies.visitors"), values: properties.map((p) => p.policies.visitors), renderValue: (v) => v },
          { key: "cancellation", label: t("policies.cancellation"), values: properties.map((p) => p.policies.cancellation), renderValue: (v) => v },
          { key: "refund", label: t("policies.refund"), values: properties.map((p) => p.policies.refund), renderValue: (v) => v },
          { key: "securityDeposit", label: t("policies.securityDeposit"), values: properties.map((p) => p.policies.securityDeposit), direction: "lower", renderValue: (v) => (v ? format(v) : t("notRequired")) },
        ].map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Gallery Preview ──────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.gallery")} icon={<ImageIcon size={18} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {properties.map((p) => (
            <div key={p.childVenueId} className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-0.5">
                {p.gallery.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="h-16 w-full object-cover" />
                ))}
              </div>
              <div className="p-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{p.venueName}</span>
                <Link
                  href={`/${locale || "en"}/${country || "in"}/search/${p.category}/${p.childVenueId}`}
                  target="_blank"
                  className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap"
                >
                  {t("viewGallery")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </ComparisonSection>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.reviews")} icon={<MessageSquareText size={18} />}>
        {[
          { key: "rating", label: t("reviews.rating"), values: properties.map((p) => p.reviews.rating), direction: "higher", renderValue: (v) => Number(v).toFixed(1), bestLabel: t("badges.topRated") },
          { key: "cleanliness", label: t("reviews.cleanliness"), values: properties.map((p) => p.reviews.cleanliness), direction: "higher", renderValue: (v) => Number(v).toFixed(1) },
          { key: "location", label: t("reviews.location"), values: properties.map((p) => p.reviews.location), direction: "higher", renderValue: (v) => Number(v).toFixed(1) },
          { key: "host", label: t("reviews.host"), values: properties.map((p) => p.reviews.host), direction: "higher", renderValue: (v) => Number(v).toFixed(1) },
          { key: "value", label: t("reviews.value"), values: properties.map((p) => p.reviews.value), direction: "higher", renderValue: (v) => Number(v).toFixed(1) },
        ].map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>
    </>
  );
}
