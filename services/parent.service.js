import api from "@/lib/axios";

/* venue-listing_create */

export const LoadParent = (cat) => {
  return api.get(`/parent-listing/parent/${cat}`);
};

export const SaveParent = (id,data) => {
  return api.put(`/parent-listing/SaveParent/${id}`,data);
};

/* ── Prefetch cache ────────────────────────────────────────────────────────
   Lets the listing page kick off LoadParent() the instant "View Details"
   is tapped (or hovered), so the request runs in parallel with the route
   transition instead of only starting after the destination page mounts.
   The destination page calls consumeParentPrefetch() first and falls back
   to a plain LoadParent() call if nothing was prefetched (e.g. a direct/
   deep link). Entries are consumed once so a stale response can never
   mask a later refetch. */
const parentPrefetchCache = new Map();

export const prefetchParent = (cat) => {
  if (!cat || parentPrefetchCache.has(cat)) return;
  parentPrefetchCache.set(
    cat,
    LoadParent(cat).catch((err) => {
      parentPrefetchCache.delete(cat);
      throw err;
    }),
  );
};

export const consumeParentPrefetch = (cat) => {
  const pending = parentPrefetchCache.get(cat);
  parentPrefetchCache.delete(cat);
  return pending || null;
};