/**
 * estateMap.js
 *
 * Shared Google Maps embed URL builder for the Location section (inline
 * widget + the "All Locations" modal both use this, so the two never
 * drift apart).
 *
 * Venues use `q=<lat>,<lng>` — raw coordinates rather than the text
 * address. Google resolves a text address/place name into a Place and
 * shows a business-card-style info window (name, open-in-Maps icon,
 * directions icon) pinned to the top of the frame; raw coordinates just
 * drop a plain pin with no card, which is what we want.
 *
 * Farmstays deliberately do NOT get an exact pin — guest privacy/security
 * for a residential stay means we only ever show the general neighborhood.
 * Coordinates are rounded to ~100m precision and passed via `ll=` (center
 * only, no `q=`), so no marker is dropped at all and the view reads as
 * "somewhere around here" rather than a pinpoint address. The rounding is
 * deliberately tight (100m, not the ~1km a 2-decimal round would give) —
 * a coastal/riverside property can have a 1km-wide circle land mostly in
 * water once you snap its center to a coarse grid, which actually makes it
 * EASIER to guess the real spot (only a thin sliver of shoreline is left
 * to search) rather than harder. Keeping the center close to the true
 * point and doing the obscuring with the zoom level / circle radius
 * instead avoids that.
 */
export function buildMapSrc(listing) {
  if (!listing?.lat || !listing?.lng) return null;

  if (listing.category === "farmstays") {
    return buildAreaMapSrc(listing.lat, listing.lng);
  }

  return `https://maps.google.com/maps?q=${listing.lat},${listing.lng}&z=16&output=embed`;
}

/**
 * Same "no exact pin" embed farmstays use, exposed on its own so
 * FarmstayAreaMap.jsx can render the real map tiles underneath its
 * approximate-area circle instead of a fake grid graphic.
 */
export function buildAreaMapSrc(lat, lng) {
  if (!lat || !lng) return null;
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  return `https://maps.google.com/maps?ll=${roundedLat},${roundedLng}&z=13&output=embed`;
}
