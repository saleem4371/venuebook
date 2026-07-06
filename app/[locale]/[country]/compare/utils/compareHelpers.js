/**
 * compareHelpers.js
 *
 * Small, generic, side-effect-free helpers shared by every comparison
 * section. Nothing here is category-specific — Venue/Farmstay experience
 * files supply their own field definitions and call into these.
 */

/** Indices (within `values`) that hold the best value for the given direction. */
export function bestIndices(values, direction) {
  const numeric = values.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  const present = numeric.filter((v) => v !== null);
  if (!present.length || !direction) return new Set();
  const target = direction === "higher" ? Math.max(...present) : Math.min(...present);
  const set = new Set();
  numeric.forEach((v, i) => { if (v === target) set.add(i); });
  // Highlighting every column when all values tie isn't useful signal
  return set.size === values.length ? new Set() : set;
}

/**
 * Single winning index for a "quick summary" stat tile — unlike
 * bestIndices(), this never suppresses the result when properties tie.
 * A summary tile ("Highest Rated — 4.9 — Property X") is standalone info,
 * not a highlighted comparison column, so a tie should still show the top
 * value + one property that has it, not disappear. Returns null only when
 * truly no property has a numeric value for this field.
 */
export function bestIndex(values, direction) {
  const numeric = values.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  const present = numeric.map((v, i) => ({ v, i })).filter((x) => x.v !== null);
  if (!present.length || !direction) return null;
  const target = direction === "higher" ? Math.max(...present.map((x) => x.v)) : Math.min(...present.map((x) => x.v));
  return present.find((x) => x.v === target).i;
}

/** True if every (non-null) value in the array is deeply/primitively equal. */
export function allEqual(values) {
  const present = values.filter((v) => v !== undefined);
  if (present.length <= 1) return true;
  const first = JSON.stringify(present[0]);
  return present.every((v) => JSON.stringify(v) === first);
}

export function formatKm(n) {
  return n == null ? null : `${n} km`;
}

export function countTruthy(obj) {
  return Object.values(obj || {}).filter(Boolean).length;
}

export function safeArray(a) {
  return Array.isArray(a) ? a : [];
}

/**
 * Score-based "which property wins which award" engine.
 * Returns a compact array the RecommendationCards component renders —
 * every reason is generated from real numbers on the compared properties,
 * never hardcoded per spec ("generated from comparison data").
 */
export function generateAwards(properties) {
  if (!properties || properties.length < 2) return [];
  const awards = [];

  // ── Best Value: best (capacity or bedrooms) per rupee ──────────────────
  const valueScored = properties.map((p) => {
    const size = p.experience === "farmstay" ? (p.accommodation?.bedrooms || 1) : (p.capacity?.maxGuests || p.maxGuests || 1);
    const price = p.minPrice || p.pricing?.startingPrice || 1;
    return { p, size, price, score: size / price };
  });
  const bestValue = valueScored.reduce((a, b) => (b.score > a.score ? b : a));
  awards.push({
    type: "bestValue",
    property: bestValue.p,
    metrics: { price: bestValue.price, size: bestValue.size },
  });

  // ── Top Rated / Luxury pick: highest rating ─────────────────────────────
  const topRated = [...properties].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  awards.push({
    type: "topRated",
    property: topRated,
    metrics: { rating: topRated.rating },
  });

  // ── Best for Families: familyFriendly / kids area / largest capacity ────
  const familyScored = properties.map((p) => {
    const familyFriendly = p.experience === "farmstay"
      ? (p.stayDetails?.familyFriendly ? 1 : 0) + (p.activities?.["Kids Area"] ? 1 : 0)
      : (p.eventSuitability?.Birthday ? 1 : 0);
    const size = p.experience === "farmstay" ? (p.accommodation?.bedrooms || 0) : (p.capacity?.maxGuests || p.maxGuests || 0);
    return { p, score: familyFriendly * 1000 + size };
  });
  const bestForFamilies = familyScored.reduce((a, b) => (b.score > a.score ? b : a));
  awards.push({
    type: "bestForFamilies",
    property: bestForFamilies.p,
    metrics: {
      size: bestForFamilies.p.experience === "farmstay"
        ? bestForFamilies.p.accommodation?.bedrooms
        : bestForFamilies.p.capacity?.maxGuests || bestForFamilies.p.maxGuests,
    },
  });

  // ── Most Amenities: highest count of true booleans across the property ─
  const amenityScored = properties.map((p) => {
    const groups = p.experience === "farmstay"
      ? [p.comfort, p.activities, p.food]
      : [p.food, ...Object.values(p.facilities || {}).map((arr) => Object.fromEntries(arr.map((f) => [f.label, f.included])))];
    const count = groups.reduce((sum, g) => sum + countTruthy(g), 0);
    return { p, count };
  });
  const mostAmenities = amenityScored.reduce((a, b) => (b.count > a.count ? b : a));
  awards.push({
    type: "mostAmenities",
    property: mostAmenities.p,
    metrics: { count: mostAmenities.count },
  });

  // De-duplicate identical (type target already distinct) but keep at most
  // one award per property+type pair — already guaranteed by construction.
  return awards;
}
