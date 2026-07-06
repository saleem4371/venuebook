"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Lightbulb, Wrench, ShieldCheck, MessageSquareText } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  ComparisonSection, FieldRow, ChipGroupCard,
  DifferenceToggle, countIdenticalFields,
} from "./shared/Primitives";

/**
 * StudioComparisonExperience — comparison attributes specific to the
 * Studios category: Studio Area, Hourly Price, Lighting, Cyclorama,
 * Equipment, Parking, Power Backup, Makeup Room, Changing Room, AC, Rating.
 * Never rendered alongside Venue/Farmstay/Workspace/Rental sections or
 * wording — a separate, category-first experience per the platform's
 * "never mix categories" rule.
 */
export default function StudioComparisonExperience({ properties }) {
  const t = useTranslations("compare.studio");
  const { format } = useCurrency();
  const [showSimilarities, setShowSimilarities] = useState(false);

  /* ── Overview ─────────────────────────────────────────────────────── */
  const overviewFields = [
    { key: "studioArea", label: t("overview.studioArea"), values: properties.map((p) => p.studioArea), direction: "higher", renderValue: (v) => t("sqftValue", { count: v }), bestLabel: t("badges.largestArea") },
    { key: "hourlyPrice", label: t("overview.hourlyPrice"), values: properties.map((p) => p.hourlyPrice), direction: "lower", renderValue: (v) => format(v), bestLabel: t("badges.lowestPrice") },
    { key: "rating", label: t("overview.rating"), values: properties.map((p) => p.reviews.rating), direction: "higher", renderValue: (v) => Number(v).toFixed(1), bestLabel: t("badges.topRated") },
  ];

  /* ── Lighting & Setup ─────────────────────────────────────────────── */
  const lightingFields = [
    { key: "lighting", label: t("lighting.lighting"), values: properties.map((p) => p.lighting), renderValue: (v) => v },
    { key: "cyclorama", label: t("lighting.cyclorama"), values: properties.map((p) => p.cyclorama), renderValue: (v) => v || t("notApplicable") },
  ];

  /* ── Facilities ───────────────────────────────────────────────────── */
  const facilityBoolFields = ["parking", "powerBackup", "makeupRoom", "changingRoom", "ac"];

  const hiddenCount = countIdenticalFields([...lightingFields]);

  return (
    <>
      {/* ── Overview ─────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.overview")} icon={<Camera size={18} />} defaultOpen>
        {overviewFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {hiddenCount > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <DifferenceToggle showSimilarities={showSimilarities} onToggle={() => setShowSimilarities((v) => !v)} hiddenCount={hiddenCount} />
        </div>
      )}

      {/* ── Lighting & Setup ─────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.lighting")} icon={<Lightbulb size={18} />}>
        {lightingFields.map((f, i) => (
          <FieldRow key={f.key} field={f} properties={properties} showSimilarities={showSimilarities} zebra={i % 2 === 1} />
        ))}
      </ComparisonSection>

      {/* ── Equipment ────────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.equipment")} icon={<Wrench size={18} />}>
        <ChipGroupCard
          label={t("sections.equipment")}
          properties={properties}
          getItems={(p) => Object.fromEntries(Object.entries(p.equipment).map(([k, v]) => [t(`equipmentItems.${k}`, { default: k }), v]))}
        />
      </ComparisonSection>

      {/* ── Facilities ───────────────────────────────────────────────── */}
      <ComparisonSection title={t("sections.facilities")} icon={<ShieldCheck size={18} />}>
        <ChipGroupCard
          label={t("sections.facilities")}
          properties={properties}
          getItems={(p) => Object.fromEntries(facilityBoolFields.map((k) => [t(`facilities.${k}`), p[k]]))}
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
