"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sparkles, CalendarCheck2, Wallet, Users, PartyPopper,
  UtensilsCrossed, LayoutGrid, ShieldCheck, Image as ImageIcon, MessageSquareText,
  ListChecks, Wifi, Shirt, Lock, BatteryCharging, Camera, Zap,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { ComparisonSection, FieldRow, ChipGroupCard, FeatureGroupCard } from "./shared/Primitives";
import { getAvailabilityStatus, VENUE_FACILITY_GROUPS } from "../data/compareSchema";
import PhotoTourOverlay from "@/app/[locale]/[country]/search/[type]/components/listing/PhotoTourOverlay";

const STATUS_STYLE = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  limited: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  booked: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
};

// One icon per amenity — lets the Amenities section read as a quick visual
// scan instead of a wall of identical-looking text chips.
const AMENITY_ICONS = {
  "WiFi": Wifi,
  "Housekeeping": Sparkles,
  "Cloakroom": Shirt,
  "Locker Storage": Lock,
  "Charging Points": BatteryCharging,
  "CCTV Surveillance": Camera,
  "In-house Catering": UtensilsCrossed,
  "Backup Generator": Zap,
};

export default function VenueComparisonExperience({ properties, selectedDate, selectedShift, locale, country }) {
  const t = useTranslations("compare.venue");
  const { format } = useCurrency();

  // Which property's gallery is currently open in the in-page overlay
  // (null = none). Previously "View Gallery" was a Link that navigated to
  // that property's own detail page — leaving the comparison entirely just
  // to look at photos. PhotoTourOverlay is the same full gallery viewer the
  // detail page itself uses, so opening it right here keeps the comparison
  // in view underneath instead of losing it.
  const [galleryProperty, setGalleryProperty] = useState(null);

  const boolText = (v) => (v ? t("yes") : t("no"));

  /* ── Quick Highlights ─────────────────────────────────────────────── */
  const highlightFields = [
    {
      key: "startingPrice", label: t("highlights.startingFrom"),
      values: properties.map((p) => p.pricing.startingPrice), direction: "lower",
      renderValue: (v) => format(v), bestLabel: t("badges.lowestPrice"),
    },
    {
      key: "capacity", label: t("highlights.capacity"), icon: <Users size={14} />,
      values: properties.map((p) => p.capacity.maxGuests), direction: "higher",
      renderValue: (v) => t("guestsValue", { count: v }), bestLabel: t("badges.highestCapacity"),
    },
    {
      key: "indoorOutdoor", label: t("highlights.indoorOutdoor"),
      values: properties.map((p) => p.indoorOutdoor), renderValue: (v) => v,
    },
  ];

  /* ── Pricing ──────────────────────────────────────────────────────── */
  const pricingFields = [
    { key: "startingPrice", label: t("pricing.starting"), values: properties.map((p) => p.pricing.startingPrice), direction: "lower", renderValue: (v) => format(v), bestLabel: t("badges.lowestPrice") },
    { key: "decorationIncluded", label: t("pricing.decoration"), values: properties.map((p) => p.pricing.decorationIncluded), renderValue: boolText },
    { key: "foodIncluded", label: t("pricing.food"), values: properties.map((p) => p.pricing.foodIncluded), renderValue: boolText },
    { key: "advanceRequired", label: t("pricing.advanceRequired"), values: properties.map((p) => p.pricing.advanceRequired), direction: "lower", renderValue: (v) => `${v}%`, bestLabel: t("badges.lowestAdvance") },
  ];

  /* ── Capacity ─────────────────────────────────────────────────────── */
  const capacityFields = [
    { key: "minGuests", label: t("capacity.minGuests"), values: properties.map((p) => p.capacity.minGuests), renderValue: (v) => t("guestsValue", { count: v }) },
    { key: "maxGuests", label: t("capacity.maxGuests"), values: properties.map((p) => p.capacity.maxGuests), direction: "higher", renderValue: (v) => t("guestsValue", { count: v }), bestLabel: t("badges.highestCapacity") },
    { key: "floatingCapacity", label: t("capacity.floating"), values: properties.map((p) => p.capacity.floatingCapacity), renderValue: (v) => (v ? t("guestsValue", { count: v }) : t("notApplicable")) },
    { key: "dining", label: t("capacity.dining"), values: properties.map((p) => p.capacity.dining), direction: "higher", renderValue: (v) => t("guestsValue", { count: v }) },
    { key: "parking", label: t("capacity.parking"), values: properties.map((p) => p.capacity.parking), direction: "higher", renderValue: (v) => t("carsValue", { count: v }), bestLabel: t("badges.mostParking") },
  ];

  return (
    <>
      {/* ── Availability ─────────────────────────────────────────────── */}
      {/* Deliberately NOT a ComparisonSection (no accordion, always
          rendered open) and placed first, before Quick Highlights — this
          is tied directly to the date/shift picked in the sticky bar above,
          so it needs to be the very first thing visible on the page. Buried
          inside a collapsed accordion further down, someone could spend
          time reading Pricing/Capacity for a property only to discover much
          later that it's not even available on their date — putting it
          up front lets that rule a property out immediately instead. */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-2 pb-1">
        {/* One combined card, not two: Availability and Quick Actions used
            to be separate rounded-xl blocks stacked on top of each other,
            each repeating its own copy of the property name. Since both are
            about the exact same property and the same decision ("is it
            available, and how do I book it"), they now live in a single
            card with one grid — each property tile carries its own
            availability badge directly above its own booking pills,
            instead of forcing a second scan through a second card to
            connect the two. */}
        <div className="rounded-xl p-3 mb-2.5 border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[var(--cat-accent)]"><CalendarCheck2 size={16} /></span>
            <h3 className="text-[13.5px] font-semibold text-gray-800 dark:text-gray-100">{t("sections.availabilityActions")}</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {properties.map((p) => {
              const status = getAvailabilityStatus(p.childVenueId, selectedDate, selectedShift);
              const href = `/${locale || "en"}/${country || "in"}/search/${p.category}/${p.childVenueId}`;
              return (
                <div key={p.childVenueId} className="rounded-lg px-3 py-2 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <p className="lg:hidden text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1">{p.venueName}</p>
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-full border ${STATUS_STYLE[status]}`}>
                    {t(`availability.${status}`)}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Link
                      href={href}
                      target="_blank"
                      className="text-[10px] font-semibold text-white px-2 py-1 rounded-full whitespace-nowrap bg-gradient-to-r from-[var(--cat-accent)] to-[var(--cat-accent-dark)] hover:opacity-90 active:scale-[0.97] transition"
                    >
                      {t("highlights.instantBook")}
                    </Link>
                    <Link
                      href={href}
                      target="_blank"
                      className="text-[10px] font-semibold text-[var(--cat-accent)] px-2 py-1 rounded-full whitespace-nowrap bg-[var(--cat-light)] border border-[var(--cat-border)] hover:bg-[var(--cat-bg)] active:scale-[0.97] transition"
                    >
                      {t("highlights.reserve")}
                    </Link>
                    <Link
                      href={href}
                      target="_blank"
                      className="text-[10px] font-medium text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full whitespace-nowrap border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.97] transition"
                    >
                      {t("highlights.enquiry")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick Highlights ─────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.highlights")} icon={<Sparkles size={18} />} defaultOpen>
        {highlightFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.pricing")} icon={<Wallet size={18} />}>
        {pricingFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Capacity ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.capacity")} icon={<Users size={18} />}>
        {capacityFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Event Preference ─────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.eventPreference")} icon={<PartyPopper size={18} />}>
        <ChipGroupCard
          label={t("sections.eventPreference")}
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

      {/* ── Amenities ──────────────────────────────────────────────────
          Distinct from Facilities below (which stays the deeper, grouped
          ✓/— checklist: Venue Features / Technology / Accessibility /
          Parking / Accommodation). Built directly rather than through
          ChipGroupCard, which shows every item for every property — true
          AND false, all the same size — so an 8-item list turned into a
          wall of near-identical chips. Here each property only shows the
          amenities it actually HAS, each with its own icon, so the card
          is only as tall as what's relevant and reads at a glance instead
          of requiring a scan through crossed-out items. */}
      <ComparisonSection title={t("sections.amenities")} icon={<ListChecks size={18} />}>
        <div className="rounded-xl p-3 mb-2.5 border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {properties.map((p) => {
              const present = Object.entries(p.amenities || {}).filter(([, v]) => v);
              return (
                <div key={p.childVenueId} className="rounded-lg p-3 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <p className="lg:hidden text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1.5">{p.venueName}</p>
                  {present.length > 0 ? (
                    <ul className="space-y-1.5">
                      {present.map(([label]) => {
                        const Icon = AMENITY_ICONS[label];
                        return (
                          <li key={label} className="flex items-center gap-2 text-[11.5px] text-gray-700 dark:text-gray-200">
                            {Icon && (
                              <span className="w-5 h-5 rounded-full bg-[var(--cat-light)] text-[var(--cat-accent)] flex items-center justify-center flex-shrink-0">
                                <Icon size={11} />
                              </span>
                            )}
                            <span className="truncate">{t(`amenityItems.${label}`, { default: label })}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-[11.5px] text-gray-400 dark:text-gray-500">{t("noAmenities")}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
                <button
                  type="button"
                  onClick={() => setGalleryProperty(p)}
                  className="text-[11px] font-semibold text-[var(--cat-accent)] whitespace-nowrap"
                >
                  {t("viewGallery")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </ComparisonSection>

      {/* Full gallery viewer — opened in-place instead of navigating to the
          property's own detail page, so the comparison stays right where
          it was underneath once the overlay closes. Same component the
          detail page itself uses (search/[type]/.../PhotoTourOverlay.jsx). */}
      <AnimatePresence>
        {galleryProperty && (
          <PhotoTourOverlay
            images={galleryProperty.gallery}
            category={galleryProperty.category}
            onClose={() => setGalleryProperty(null)}
          />
        )}
      </AnimatePresence>

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
