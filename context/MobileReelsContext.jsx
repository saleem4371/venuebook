"use client";

/**
 * MobileReelsContext — global state for the mobile fullscreen reel viewer.
 *
 * Mount <MobileReelsProvider> once in ClientLayout.
 * Any page or component can then either:
 *
 *  1. Call openReels(opts) directly — e.g. "open reel for this property"
 *
 *  2. Call registerSource(fn) to advertise the page's current venue list.
 *     The GlobalReelsBridge in ClientLayout will call getActiveSource() and
 *     openReels() automatically when the user taps the Reels nav item.
 *
 * openReels({
 *   venues      : VenueObject[]   — reels to browse
 *   startIndex? : number          — which reel to open at.
 *                                   Omit to auto-resume from last watched
 *                                   position for this category.
 *   category    : string
 *   locale      : string
 *   country     : string
 *   wishlist?   : WishlistItem[]
 *   compares?   : CompareItem[]
 *   onWishlist? : (venue) => void
 *   onCompare?  : (venue, add) => void
 * })
 *
 * registerSource(fn):
 *   fn must return an openReels opts object (above) when called.
 *   Call unregisterSource() on component unmount to avoid stale closures.
 *
 * When closed, the viewer calls closeReels(activeIdx, category) so the
 * context remembers the last watched position per category.
 */

import { createContext, useContext, useState, useCallback, useRef } from "react";

const MobileReelsContext = createContext(null);

export function MobileReelsProvider({ children }) {
  const [reelsState, setReelsState] = useState(null);

  /**
   * Per-category last-watched index.
   * Stored in a ref so updates don't trigger re-renders.
   * Shape: { [category: string]: number }
   */
  const lastPositions = useRef({});

  /**
   * Active reels source — set by whichever page is currently mounted
   * and has venues to show.  Stored as a ref-to-function so changes
   * never cause context consumers to re-render unnecessarily.
   *
   * The stored function returns a full openReels opts object when called:
   *   () => { venues, category, locale, country, wishlist, compares,
   *            onWishlist, onCompare }
   */
  const reelsSource = useRef(null);

  /** Called by a page to advertise its venue list as the global reels source. */
  const registerSource = useCallback((fn) => {
    reelsSource.current = fn;
  }, []);

  /** Call on component unmount so a stale source isn't left behind. */
  const unregisterSource = useCallback(() => {
    reelsSource.current = null;
  }, []);

  /**
   * Returns the opts object from the currently registered source, or null.
   * Used by GlobalReelsBridge in ClientLayout to open reels from any page.
   */
  const getActiveSource = useCallback(() => {
    return reelsSource.current?.() ?? null;
  }, []);

  const openReels = useCallback((opts) => {
    const { category, startIndex } = opts;
    const idx = startIndex !== undefined
      ? startIndex
      : (lastPositions.current[category] ?? 0);
    setReelsState({ ...opts, startIndex: idx });
  }, []);

  const closeReels = useCallback((activeIdx, category) => {
    if (category != null && activeIdx != null) {
      lastPositions.current[category] = activeIdx;
    }
    setReelsState(null);
  }, []);

  return (
    <MobileReelsContext.Provider value={{
      reelsState,
      openReels,
      closeReels,
      registerSource,
      unregisterSource,
      getActiveSource,
    }}>
      {children}
    </MobileReelsContext.Provider>
  );
}

export function useMobileReels() {
  const ctx = useContext(MobileReelsContext);
  if (!ctx) throw new Error("useMobileReels must be used inside <MobileReelsProvider>");
  return ctx;
}
