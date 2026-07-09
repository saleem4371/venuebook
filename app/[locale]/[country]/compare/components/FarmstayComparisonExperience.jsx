"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Home, Clock, BedDouble, TentTree, UtensilsCrossed,
  MapPinned, ShieldCheck, Image as ImageIcon, MessageSquareText,
  ListChecks, Wifi, Snowflake, Zap, Tv, Briefcase, WashingMachine, Droplet,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { ComparisonSection, FieldRow, ChipGroupCard } from "./shared/Primitives";
import { bestIndices } from "../utils/compareHelpers";
import PhotoTourOverlay from "@/app/[locale]/[country]/search/[type]/components/listing/PhotoTourOverlay";

// One icon per amenity — same treatment as VenueComparisonExperience's
// Amenities section (icon-per-item, only what's actually present shown)
// instead of this section's old plain colored yes/no chip wall, where every
// property showed all 7 items whether true or false.
const FARM_AMENITY_ICONS = {
  "AC": Snowflake,
  "WiFi": Wifi,
  "Power Backup": Zap,
  "TV": Tv,
  "Workspace": Briefcase,
  "Washing Machine": WashingMachine,
  "Hot Water": Droplet,
};

export default function FarmstayComparisonExperience({ properties, locale, country }) {
  const t = useTranslations("compare.farmstay");
  const { format } = useCurrency();

  // See VenueComparisonExperience.jsx for the full rationale: opens the
  // same full gallery viewer the detail page uses, in-place, instead of
  // navigating away from the comparison to see photos.
  const [galleryProperty, setGalleryProperty] = useState(null);

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
  /* Pet policy, smoking, and family/kids suitability all moved out of here
     and into Policies — pet policy was already duplicated there
     (policies.pets), and "Couple Friendly" read as a marketing pitch
     rather than a fact, which fits better as a plain house-rule-style
     statement under Policies than a "friendly" label here. */
  const stayFields = [
    { key: "checkIn", label: t("stay.checkIn"), values: properties.map((p) => p.stayDetails.checkIn), renderValue: (v) => v },
    { key: "checkOut", label: t("stay.checkOut"), values: properties.map((p) => p.stayDetails.checkOut), renderValue: (v) => v },
    { key: "mealsIncluded", label: t("stay.mealsIncluded"), values: properties.map((p) => p.stayDetails.mealsIncluded), renderValue: (v) => v },
    { key: "caretaker", label: t("stay.caretaker"), values: properties.map((p) => p.stayDetails.caretaker), renderValue: boolText },
  ];

  /* ── Accommodation ────────────────────────────────────────────────────── */
  const accommodationFields = [
    { key: "bedrooms", label: t("accommodation.bedrooms"), values: properties.map((p) => p.accommodation.bedrooms), direction: "higher", renderValue: (v) => t("bedroomsValue", { count: v }) },
    { key: "beds", label: t("accommodation.beds"), values: properties.map((p) => p.accommodation.beds), direction: "higher", renderValue: (v) => t("bedsValue", { count: v }) },
    { key: "bathrooms", label: t("accommodation.bathrooms"), values: properties.map((p) => p.accommodation.bathrooms), renderValue: (v) => t("bathroomsValue", { count: v }) },
  ];

  /* ── Nearby ─────────────────────────────────────────────────────────────
     "Attraction" is now a small LIST per property (2-4 different types,
     nearest first) instead of a single hardcoded "Lake" field — a real
     farmstay is usually near more than one thing worth seeing. Each
     property's own attractions are stacked inside its own card (see the
     bespoke block in the Nearby section below) rather than one attraction
     type compared side-by-side across properties, since there's no single
     shared "field" to line up anymore once each property can have a
     different number of attractions.
     "City" pairs its distance with a genuinely different nearby town name
     (p.nearby.townName) so the row reads "12 km from Madikeri" — NOT the
     property's own city/region field (that would say something like "12 km
     from Coorg" for a farmstay that's already located IN Coorg, which reads
     as a farmstay being 12 km from itself). */
  const cityField = {
    key: "City",
    label: t("nearby.City"),
    values: properties.map((p) => p.nearby.City),
    direction: "lower",
    renderValue: (v, p) => (v == null
      ? t("notApplicable")
      : t("nearby.cityValue", { city: p.nearby.townName || t("nearby.town"), count: v })),
  };
  const otherNearbyFields = ["Airport", "Hospital", "Market"].map((label) => ({
    key: label,
    label: t(`nearby.${label}`),
    values: properties.map((p) => p.nearby[label]),
    direction: "lower",
    renderValue: (v) => (v == null ? t("notApplicable") : t("kmValue", { count: v })),
  }));
  // Attraction is rendered separately, stacked one row per property (see
  // the Nearby section below) instead of the usual side-by-side grid — so
  // it's still in this list conceptually but pulled out of what actually
  // renders via FieldRow's grid layout.
  const nearbyFields = [cityField, ...otherNearbyFields];

  return (
    <>
      {/* ── Overview highlights ────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.overview")} icon={<Home size={18} />} defaultOpen>
        {overviewFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Stay Details ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.stayDetails")} icon={<Clock size={18} />}>
        {stayFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Accommodation ────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.accommodation")} icon={<BedDouble size={18} />}>
        {accommodationFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Amenities (same icon-list treatment as Venue's Amenities
          section) — each property only shows the in-room conveniences it
          actually has, each with its own icon, instead of every one of the
          7 possible items shown as a true/false chip regardless. */}
      <ComparisonSection title={t("sections.amenities")} icon={<ListChecks size={18} />}>
        <div className="rounded-xl p-3 mb-2.5 border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {properties.map((p) => {
              const present = Object.entries(p.comfort || {}).filter(([, v]) => v);
              return (
                <div key={p.childVenueId} className="rounded-lg p-3 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <p className="lg:hidden text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1.5">{p.venueName}</p>
                  {present.length > 0 ? (
                    <ul className="space-y-1.5">
                      {present.map(([label]) => {
                        const Icon = FARM_AMENITY_ICONS[label];
                        return (
                          <li key={label} className="flex items-center gap-2 text-[11.5px] text-gray-700 dark:text-gray-200">
                            {Icon && (
                              <span className="w-5 h-5 rounded-full bg-[var(--cat-light)] text-[var(--cat-accent)] flex items-center justify-center flex-shrink-0">
                                <Icon size={11} />
                              </span>
                            )}
                            <span className="truncate">{t(`comfort.${label}`, { default: label })}</span>
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

      {/* ── Food ─────────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.food")} icon={<UtensilsCrossed size={18} />}>
        <ChipGroupCard
          label={t("sections.food")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.food).map(([k, v]) => [t(`foodItems.${k}`, { default: k }), v]))}
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

      {/* ── Policies ─────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.policies")} icon={<ShieldCheck size={18} />}>
        {[
          { key: "pets", label: t("policies.pets"), values: properties.map((p) => p.policies.pets), renderValue: boolText },
          { key: "smoking", label: t("stay.smoking"), values: properties.map((p) => p.policies.smoking), renderValue: (v) => v },
          { key: "kidsSuitable", label: t("policies.kidsSuitable"), values: properties.map((p) => p.policies.kidsSuitable), renderValue: boolText },
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
          property's own detail page. Same component the detail page itself
          uses (search/[type]/.../PhotoTourOverlay.jsx). */}
      <AnimatePresence>
        {galleryProperty && (
          <PhotoTourOverlay
            images={galleryProperty.gallery}
            category={galleryProperty.category}
            onClose={() => setGalleryProperty(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Reviews — same shape as VenueComparisonExperience's Reviews
          section: just Overall Rating + Review Count, not every individual
          sub-rating (cleanliness/location/host/value) the raw data happens
          to carry. */}
      <ComparisonSection title={t("sections.reviews")} icon={<MessageSquareText size={18} />}>
        <FieldRow
          field={{
            key: "rating", label: t("reviews.rating"),
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

      {/* ── Nearby ───────────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.nearby")} icon={<MapPinned size={18} />}>
        {/* Nearest Attraction: one card per property, stacked top to bottom
            (not the usual side-by-side grid) — and INSIDE each property's
            card, every one of its 2-4 nearby attractions is listed, nearest
            first, each on its own line. Previously this showed only a
            single attraction per property; now a property with a lake AND
            a river AND a waterfall nearby actually shows all of them. The
            whole card is tinted green for whichever property's closest
            attraction (the first, nearest-sorted line) beats every other
            property's closest one. */}
        <div className="rounded-xl p-3 mb-2.5 border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <h4 className="text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {t("nearby.attraction")}
          </h4>
          <div className="flex flex-col gap-2">
            {(() => {
              const closestKm = properties.map((p) => p.nearby.attractions?.[0]?.km ?? null);
              const winners = bestIndices(closestKm, "lower");
              return properties.map((p, i) => {
                const isBest = winners.has(i);
                const attractions = p.nearby.attractions || [];
                return (
                  <div
                    key={p.childVenueId}
                    className={`rounded-lg px-3 py-2 border transition-colors ${
                      isBest
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1">{p.venueName}</p>
                    {attractions.length > 0 ? (
                      <ul className="space-y-0.5">
                        {attractions.map(({ type, km }) => (
                          <li
                            key={type}
                            className={`text-[13px] font-semibold leading-snug truncate ${isBest ? "text-emerald-700 dark:text-emerald-300" : "text-gray-900 dark:text-gray-100"}`}
                          >
                            {t("nearby.attractionValue", { type: t(`nearby.attractionTypes.${type}`), count: km })}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-gray-400 dark:text-gray-500">{t("notApplicable")}</p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {nearbyFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>
    </>
  );
}
