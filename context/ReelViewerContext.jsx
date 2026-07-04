"use client";

/**
 * ReelViewerContext
 * ─────────────────
 * Global state for the universal fullscreen reel viewer.
 * Any page can call openViewer() to open immersive reels;
 * the viewer is mounted once in ClientLayout and is always available.
 *
 * openViewer({
 *   venues      : VenueObject[]   — array of venues to browse
 *   startIndex  : number          — which reel to open at (default 0)
 *   category    : string          — active category key
 *   locale      : string
 *   country     : string
 *   wishlist?   : WishlistItem[]  — for heart state
 *   compares?   : CompareItem[]   — for compare state
 *   onWishlist? : (venue) => void
 *   onCompare?  : (venue, add) => void
 * })
 */

import { createContext, useContext, useState, useCallback } from "react";

const ReelViewerContext = createContext(null);

export function ReelViewerProvider({ children }) {
  const [viewerState, setViewerState] = useState(null);

  const openViewer = useCallback((opts) => {
    setViewerState({ startIndex: 0, wishlist: [], compares: [], ...opts });
  }, []);

  const closeViewer = useCallback(() => {
    setViewerState(null);
  }, []);

  return (
    <ReelViewerContext.Provider value={{ viewerState, openViewer, closeViewer }}>
      {children}
    </ReelViewerContext.Provider>
  );
}

export function useReelViewer() {
  const ctx = useContext(ReelViewerContext);
  if (!ctx) throw new Error("useReelViewer must be used inside <ReelViewerProvider>");
  return ctx;
}
