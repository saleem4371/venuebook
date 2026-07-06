"use client";

import { useTranslations } from "next-intl";
import { TrendingDown, Star, Users, BedDouble, Maximize, Sparkles, TentTree, Presentation } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { bestIndex, countTruthy } from "../utils/compareHelpers";

function StatTile({ icon, label, value, propertyName }) {
  return (
    <div className="min-h-[88px] sm:min-h-24 flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3.5 sm:px-4 py-3.5 sm:py-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-100 truncate">{value}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{propertyName}</p>
      </div>
    </div>
  );
}

/**
 * Quick-summary tiles: a fixed set of exactly 4 per category — the set
 * never grows or shrinks based on the data (no tile silently disappearing
 * because two properties tied, or appearing only when a rare field like
 * "private pool" happens to be present). What DOES change with the data is
 * each tile's winning value/property, correctly recomputed for however many
 * properties are actually being compared (2, 3, or 4).
 *
 * bestIndex() (not bestIndices()) is used deliberately — unlike the
 * highlight logic in ComparisonBlock, a standalone summary tile should
 * still show a value + property even when everyone ties, so it never
 * needs to hide itself.
 */
export default function QuickCompareSummary({ properties, experience }) {
  const t = useTranslations("compare.quickSummary");
  const { format } = useCurrency();

  const tiles = [];
  const add = (idx, build) => { if (idx != null) tiles.push(build()); };

  // ── Price — every experience has one, just from a different field ─────
  const prices = properties.map((p) => {
    if (experience === "workspace") return p.pricing?.rate ?? null;
    return p.minPrice ?? p.pricing?.startingPrice ?? p.hourlyPrice ?? null;
  });
  const bestPriceIdx = bestIndex(prices, "lower");
  add(bestPriceIdx, () => ({
    icon: <TrendingDown size={17} />,
    label: t("bestPrice"),
    value: format(prices[bestPriceIdx]),
    propertyName: properties[bestPriceIdx].venueName,
  }));

  // ── Rating — every experience has one ──────────────────────────────────
  const ratings = properties.map((p) => p.reviews?.rating ?? p.rating ?? null);
  const bestRatingIdx = bestIndex(ratings, "higher");
  add(bestRatingIdx, () => ({
    icon: <Star size={17} className="fill-current" />,
    label: t("highestRated"),
    value: Number(ratings[bestRatingIdx]).toFixed(1),
    propertyName: properties[bestRatingIdx].venueName,
  }));

  if (experience === "farmstay") {
    const acres = properties.map((p) => p.acres ?? null);
    const bestAcresIdx = bestIndex(acres, "higher");
    add(bestAcresIdx, () => ({
      icon: <Maximize size={17} />,
      label: t("largestEstate"),
      value: t("acresValue", { count: acres[bestAcresIdx] }),
      propertyName: properties[bestAcresIdx].venueName,
    }));

    const activityCounts = properties.map((p) => countTruthy(p.activities));
    const bestActivitiesIdx = bestIndex(activityCounts, "higher");
    add(bestActivitiesIdx, () => ({
      icon: <TentTree size={17} />,
      label: t("mostActivities"),
      value: t("activitiesValue", { count: activityCounts[bestActivitiesIdx] }),
      propertyName: properties[bestActivitiesIdx].venueName,
    }));
  } else if (experience === "studio") {
    const areas = properties.map((p) => p.studioArea ?? null);
    const bestAreaIdx = bestIndex(areas, "higher");
    add(bestAreaIdx, () => ({
      icon: <Maximize size={17} />,
      label: t("largestArea"),
      value: t("sqftValue", { count: areas[bestAreaIdx] }),
      propertyName: properties[bestAreaIdx].venueName,
    }));

    const equipmentCounts = properties.map((p) => countTruthy(p.equipment));
    const bestEquipmentIdx = bestIndex(equipmentCounts, "higher");
    add(bestEquipmentIdx, () => ({
      icon: <Sparkles size={17} />,
      label: t("mostEquipment"),
      value: t("itemsValue", { count: equipmentCounts[bestEquipmentIdx] }),
      propertyName: properties[bestEquipmentIdx].venueName,
    }));
  } else if (experience === "workspace") {
    const seats = properties.map((p) => p.seats ?? null);
    const bestSeatsIdx = bestIndex(seats, "higher");
    add(bestSeatsIdx, () => ({
      icon: <Users size={17} />,
      label: t("mostSeats"),
      value: t("seatsValue", { count: seats[bestSeatsIdx] }),
      propertyName: properties[bestSeatsIdx].venueName,
    }));

    const rooms = properties.map((p) => p.meetingRooms ?? null);
    const bestRoomsIdx = bestIndex(rooms, "higher");
    add(bestRoomsIdx, () => ({
      icon: <Presentation size={17} />,
      label: t("mostMeetingRooms"),
      value: t("roomsValue", { count: rooms[bestRoomsIdx] }),
      propertyName: properties[bestRoomsIdx].venueName,
    }));
  } else if (experience === "rental") {
    const guests = properties.map((p) => p.maxGuests ?? null);
    const bestGuestsIdx = bestIndex(guests, "higher");
    add(bestGuestsIdx, () => ({
      icon: <Users size={17} />,
      label: t("mostGuests"),
      value: t("guestsValue", { count: guests[bestGuestsIdx] }),
      propertyName: properties[bestGuestsIdx].venueName,
    }));

    const bedrooms = properties.map((p) => p.bedrooms ?? null);
    const bestBedroomsIdx = bestIndex(bedrooms, "higher");
    add(bestBedroomsIdx, () => ({
      icon: <BedDouble size={17} />,
      label: t("mostBedrooms"),
      value: t("bedroomsValue", { count: bedrooms[bestBedroomsIdx] }),
      propertyName: properties[bestBedroomsIdx].venueName,
    }));
  } else {
    // Venue (and anything without a dedicated experience yet) — 4 tiles,
    // same count as every other category (dropped "Largest Area" so venue
    // isn't the odd one out at 5 while everyone else has 4).
    const capacities = properties.map((p) => p.capacity?.maxGuests ?? p.maxGuests ?? null);
    const bestCapacityIdx = bestIndex(capacities, "higher");
    add(bestCapacityIdx, () => ({
      icon: <Users size={17} />,
      label: t("highestCapacity"),
      value: t("guestsValue", { count: capacities[bestCapacityIdx] }),
      propertyName: properties[bestCapacityIdx].venueName,
    }));

    const amenityCounts = properties.map((p) => {
      const facilityCount = Object.values(p.facilities || {}).reduce(
        (sum, group) => sum + group.filter((f) => f.included).length, 0
      );
      return countTruthy(p.food) + facilityCount;
    });
    const bestAmenitiesIdx = bestIndex(amenityCounts, "higher");
    add(bestAmenitiesIdx, () => ({
      icon: <Sparkles size={17} />,
      label: t("mostAmenities"),
      value: t("itemsValue", { count: amenityCounts[bestAmenitiesIdx] }),
      propertyName: properties[bestAmenitiesIdx].venueName,
    }));
  }

  if (!tiles.length) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-5 pb-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((tile, i) => (
          <StatTile key={i} {...tile} />
        ))}
      </div>
    </div>
  );
}
