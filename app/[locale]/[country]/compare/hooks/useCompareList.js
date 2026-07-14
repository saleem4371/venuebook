"use client";

/**
 * useCompareList.js
 *
 * Wires the Compare page to the real backend:
 *   GET  /listing/UserCompare   → the signed-in user's saved compare set
 *   POST /listing/removeCompare → remove one property
 *   GET  /listing/UserWishlist  / save_wishlist_category / remove_wishlist
 *
 * These endpoints exist in services/venues.service.js and are already used
 * by the search page, but nothing in this codebase currently renders their
 * *response shape* end-to-end — the search page only ever sends payloads to
 * them, it never reads UserCompare()/UserWishlist() back. So the exact field
 * names on a compare/wishlist row are unverified. We read defensively
 * (several fallback field names) and hydrate the *real* comparable data by
 * matching the id against STATIC_VENUES — the same dataset search/map/reels
 * already treat as the source of truth for listing details.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  UserCompare,
  addCompareAPI,
  removeCompareAPI,
  UserWishlist,
  save_wishlist_category,
  remove_wishlist,
} from "@/services/venues.service";
import { STATIC_VENUES } from "@/app/[locale]/[country]/search/[type]/data/staticVenues";
import { enrichProperty } from "../data/compareSchema";

import { useCategory } from "@/context/CategoryContext";

function extractId(raw) {
  return raw?.venue_id || raw?.childVenueId || raw?.child_venue_id || raw?.id || raw?.venueId || null;
}

function unwrapList(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
}

export function useCompareList() {
  const { user, loading: authLoading } = useAuth();
  const [rawItems, setRawItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { activeCategory } = useCategory();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [compareRes, wishlistRes] = await Promise.allSettled([UserCompare(), UserWishlist()]);
      setRawItems(compareRes.status === "fulfilled" ? unwrapList(compareRes.value) : []);
      const wl = wishlistRes.status === "fulfilled" ? unwrapList(wishlistRes.value) : [];
      setWishlistIds(new Set(wl.map(extractId).filter(Boolean)));
    } catch (err) {
      setError(err);
      setRawItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setRawItems([]); setLoading(false); return; }
    load();
  }, [user, authLoading, load, activeCategory]);

  /** Raw compare rows → fully enriched, comparison-ready property objects. */
  const properties = useMemo(() => {
    return rawItems
      .map((raw) => {
        const id = extractId(raw);
        const staticMatch = STATIC_VENUES.find((v) => v.childVenueId === id);
        const base = staticMatch || (id
          ? {
              childVenueId: id,
              venueName: raw?.title || raw?.name || raw?.venueName || "Property",
              parentVenueName: raw?.parentVenueName || raw?.estate || "",
              category: raw?.category || "venues",
              city: raw?.city || "",
              state: raw?.state || "",
              images: raw?.image ? [raw.image] : raw?.images || [],
              minPrice: raw?.price || raw?.minPrice || null,
              rating: raw?.rating || 4.5,
              reviewCount: raw?.reviewCount || 0,
              maxGuests: raw?.maxGuests || null,
              bedrooms: raw?.bedrooms || null,
            }
          : null);
        return base ? enrichProperty(base) : null;
      })
      .filter(Boolean);
  }, [rawItems]);

  // const remove = useCallback(async (childVenueId) => {
  //   setRawItems((prev) => prev.filter((r) => extractId(r) !== childVenueId));
  //   try { await removeCompareAPI({ venue_id: childVenueId }); } catch (_) { /* optimistic — already removed locally */ }
  // }, []);
  
   const handleCompare = useCallback(
      async (venue, action) => {
        if (!user) {
          setLoginOpen(true);
          return;
        }
        const payload = { venue_id: venue.childVenueId };
        action ? await addCompareAPI(payload) : await removeCompareAPI(payload);
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [user, load],
    );

  /**
   * Add a venue back into the compare set — used by the "Add Venue" slot
   * that appears wherever a property was removed (or a slot was never
   * filled), so the grid never has to look empty. Same payload shape as
   * search/[type]/page.jsx's handleCompare: { venue_id }.
   */
  // const add = useCallback(async (childVenueId) => {
  //   setRawItems((prev) => (
  //     prev.some((r) => extractId(r) === childVenueId) ? prev : [...prev, { venue_id: childVenueId }]
  //   ));
  //   try { await addCompareAPI({ venue_id: childVenueId }); } catch (_) { /* optimistic — already added locally */ }
  
  // }, []);

  const add = useCallback(async (childVenueId) => {
  try {
    await addCompareAPI({ venue_id: childVenueId });
    await load();
  } catch (err) {
    console.error(err);
  }
}, [load]);

const remove = useCallback(async (childVenueId) => {
  try {
    await removeCompareAPI({ venue_id: childVenueId });
    await load();
  } catch (err) {
    console.error(err);
  }
}, [load]);

  const toggleWishlist = useCallback(async (childVenueId) => {
    const isSaved = wishlistIds.has(childVenueId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(childVenueId); else next.add(childVenueId);
      return next;
    });
    try {
      if (isSaved) await remove_wishlist({ venue_id: childVenueId });
      else await save_wishlist_category({ venue_id: childVenueId });
    } catch (_) { /* optimistic UI already applied */ }
  }, [wishlistIds]);

  return {
    properties,
    loading: loading || authLoading,
    error,
    add,
    remove,
    toggleWishlist,
    wishlistIds,
    reload: load,
  };
}
