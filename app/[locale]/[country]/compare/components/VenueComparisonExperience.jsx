"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Sparkles, CalendarCheck2, Wallet, Users, PartyPopper,
  UtensilsCrossed, LayoutGrid, ShieldCheck, Image as ImageIcon, MessageSquareText,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  ComparisonSection, FieldRow, ChipGroupCard, FeatureGroupCard,
  DifferenceToggle, countIdenticalFields,
} from "./shared/Primitives";
import { getAvailabilityStatus, VENUE_FACILITY_GROUPS } from "../data/compareSchema";

const STATUS_STYLE = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  limited: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  booked: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
};

export default function VenueComparisonExperience({ properties, selectedDate, selectedShift, locale, country }) {
  const t = useTranslations("compare.venue");
  const { format } = useCurrency();
  const [showSimilarities, setShowSimilarities] = useState(false);

  const boolText = (v) => (v ? t("yes") : t("no"));

  /* ── Quick Highlights ─────────────────────────────────────────────── */
  const highlightFields = [
    {
      key: "capacity", label: t("highlights.capacity"), icon: <Users size={14} />,
      values: properties.map((p) => p.capacity.maxGuests), direction: "higher",
      renderValue: (v) => t("guestsValue", { count: v }), bestLabel: t("badges.highestCapacity"),
    },
    {
      key: "indoorOutdoor", label: t("highlights.indoorOutdoor"),
      values: properties.map((p) => p.indoorOutdoor), renderValue: (v) => v,
    },
    {
      key: "startingPrice", label: t("highlights.startingFrom"),
      values: properties.map((p) => p.pricing.startingPrice), direction: "lower",
      renderValue: (v) => format(v), bestLabel: t("badges.lowestPrice"),
    },
  ];

  /* ── Pricing ──────────────────────────────────────────────────────── */
  const pricingFields = [
    { key: "startingPrice", label: t("pricing.starting"), values: properties.map((p) => p.pricing.startingPrice), direction: "lower", renderValue: (v) => format(v), bestLabel: t("badges.lowestPrice") },
    { key: "peakPrice", label: t("pricing.peak"), values: properties.map((p) => p.pricing.peakPrice), direction: "lower", renderValue: (v) => format(v) },
    { key: "offSeasonPrice", label: t("pricing.offSeason"), values: properties.map((p) => p.pricing.offSeasonPrice), direction: "lower", renderValue: (v) => format(v) },
    { key: "decorationIncluded", label: t("pricing.decoration"), values: properties.map((p) => p.pricing.decorationIncluded), renderValue: boolText },
    { key: "foodIncluded", label: t("pricing.food"), values: properties.map((p) => p.pricing.foodIncluded), renderValue: boolText },
    { key: "taxesIncluded", label: t("pricing.taxes"), values: properties.map((p) => p.pricing.taxesIncluded), renderValue: boolText },
    { key: "cancellation", label: t("pricing.cancellation"), values: properties.map((p) => p.pricing.cancellation), renderValue: (v) => v },
    { key: "advanceRequired", label: t("pricing.advanceRequired"), values: properties.map((p) => p.pricing.advanceRequired), direction: "lower", renderValue: (v) => `${v}%`, bestLabel: t("badges.lowestAdvance") },
  ];

  /* ── Capacity ─────────────────────────────────────────────────────── */
  const capacityFields = [
    { key: "minGuests", label: t("capacity.minGuests"), values: properties.map((p) => p.capacity.minGuests), renderValue: (v) => t("guestsValue", { count: v }) },
    { key: "maxGuests", label: t("capacity.maxGuests"), values: properties.map((p) => p.capacity.maxGuests), direction: "higher", renderValue: (v) => t("guestsValue", { count: v }), bestLabel: t("badges.highestCapacity") },
    { key: "floatingCapacity", label: t("capacity.floating"), values: properties.map((p) => p.capacity.floatingCapacity), renderValue: (v) => (v ? t("guestsValue", { count: v }) : t("notApplicable")) },
    { key: "dining", label: t("capacity.dining"), values: properties.map((p) => p.capacity.dining), direction: "higher", renderValue: (v) => t("guestsValue", { count: v }) },
    { key: "parking", label: t("capacity.parking"), values: properties.map((p) => p.capacity.parking), direction: "higher", renderValue: (v) => t("carsValue", { count: v }), bestLabel: t("badges.mostParking") },
    { key: "stageSize", label: t("capacity.stageSize"), values: properties.map((p) => p.capacity.stageSize), renderValue: (v) => v },
    { key: "roomsAvailable", label: t("capacity.rooms"), values: properties.map((p) => p.capacity.roomsAvailable), direction: "higher", renderValue: (v) => (v ? t("roomsValue", { count: v }) : t("notApplicable")) },
    { key: "hallArea", label: t("capacity.hallArea"), values: properties.map((p) => p.hallAreaSqft), direction: "higher", renderValue: (v) => t("sqftValue", { count: v }), bestLabel: t("badges.largestArea") },
    { key: "seatingStyle", label: t("capacity.seatingStyle"), values: properties.map((p) => p.seatingStyle), renderValue: (v) => v },
  ];

  const allComparableFields = [...pricingFields, ...capacityFields];
  const hiddenCount = countIdenticalFields(allComparableFields);

  return (
    <>
      {/* ── Quick Highlights ─────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.highlights")} icon={<Sparkles size={18} />} defaultOpen>
        {highlightFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Availability ─────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.availability")} icon={<CalendarCheck2 size={18} />}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {properties.map((p) => {
            const status = getAvailabilityStatus(p.childVenueId, selectedDate, selectedShift);
            return (
              <div key={p.childVenueId} className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <p className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate mb-2">{p.venueName}</p>
                <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-full border ${STATUS_STYLE[status]}`}>
                  {t(`availability.${status}`)}
                </span>
              </div>
            );
          })}
        </div>
      </ComparisonSection>

      {/* ── Difference toggle applies to Pricing + Capacity below ───────
          Only rendered when there's actually something to hide — with
          nothing collapsed, the control has nothing useful to do. ────── */}
      {hiddenCount > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <DifferenceToggle showSimilarities={showSimilarities} onToggle={() => setShowSimilarities((v) => !v)} hiddenCount={hiddenCount} />
        </div>
      )}

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.pricing")} icon={<Wallet size={18} />}>
        {pricingFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Capacity ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.capacity")} icon={<Users size={18} />}>
        {capacityFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Event Suitability ────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.eventSuitability")} icon={<PartyPopper size={18} />}>
        <ChipGroupCard
          label={t("sections.eventSuitability")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.eventSuitability).map(([k, v]) => [t(`eventTypes.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Food ─────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.food")} icon={<UtensilsCrossed size={18} />}>
        <ChipGroupCard
          label={t("sections.food")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.food).map(([k, v]) => [t(`foodItems.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Facilities ───────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.facilities")} icon={<LayoutGrid size={18} />}>
        {Object.keys(VENUE_FACILITY_GROUPS).map((group) => (
          <FeatureGroupCard
            key={group}
            label={t(`facilityGroups.${group}`, { default: group })}
            properties={properties}
            getItems={(p) => p.facilities[group]}
          />
        ))}
      </ComparisonSection>

      {/* ── Policies ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.policies")} icon={<ShieldCheck size={18} />}>
        {[
          { key: "operatingHours", label: t("policies.operatingHours"), values: properties.map((p) => p.operatingHours), renderValue: (v) => v },
          { key: "musicTiming", label: t("policies.musicTiming"), values: properties.map((p) => p.policies.musicTiming), renderValue: (v) => v },
          { key: "noiseRestriction", label: t("policies.noiseRestriction"), values: properties.map((p) => p.policies.noiseRestriction), renderValue: (v) => v },
          { key: "outsideVendors", label: t("policies.outsideVendors"), values: properties.map((p) => p.policies.outsideVendors), renderValue: boolText },
          { key: "smoking", label: t("policies.smoking"), values: properties.map((p) => p.policies.smoking), renderValue: (v) => v },
          { key: "pets", label: t("policies.pets"), values: properties.map((p) => p.policies.pets), renderValue: boolText },
          { key: "decorRules", label: t("policies.decorRules"), values: properties.map((p) => p.policies.decorRules), renderValue: (v) => v },
          { key: "cleaning", label: t("policies.cleaning"), values: properties.map((p) => p.policies.cleaning), renderValue: (v) => v },
          { key: "liquorPolicy", label: t("policies.liquorPolicy"), values: properties.map((p) => p.policies.liquorPolicy), renderValue: (v) => v },
        ].map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Gallery Preview ──────────────────────────────────────────── */}
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

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.reviews")} icon={<MessageSquareText size={18} />}>
        <FieldRow
          field={{
            key: "rating", label: t("reviews.overallRating"),
            values: properties.map((p) => p.reviews.rating), direction: "higher",
            renderValue: (v) => Number(v).toFixed(1), bestLabel: t("badges.topRated"),
          }}
          properties={properties} showSimilarities
        />
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
