"use client";

/**
 * hooks/useMapboxGL.js
 *
 * Isolated Mapbox GL JS bootstrap layer — every map component in the app
 * (MapView, ReadonlyLocationMap, ApproximateLocationMap) goes through this
 * module instead of importing "mapbox-gl" directly. Keeping the loading /
 * token / WebGL-detection logic in one place means Mapbox specifics never
 * leak into component code, and swapping providers later only touches this
 * file.
 *
 * IMPORTANT: mapbox-gl touches `window` at import time, so it is ALWAYS
 * dynamically imported (never a static top-level `import`). This keeps it
 * out of the server bundle and guarantees it only ever initializes on the
 * client, per Next.js App Router SSR constraints.
 */

let mapboxglModulePromise = null;

/** True if the Mapbox public token has been configured in the environment. */
export function isMapboxTokenConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
}

/** Best-effort WebGL availability check — Mapbox GL requires WebGL. */
export function isWebGLSupported() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Dynamically loads the mapbox-gl module (once — cached across callers),
 * sets the access token from NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN, and resolves
 * with the mapboxgl namespace. Resolves to null on the server or if the
 * token is missing/WebGL is unavailable — callers are expected to check
 * `isMapboxTokenConfigured()` / `isWebGLSupported()` themselves for
 * user-facing error states; this function stays a thin loader.
 */
export function loadMapboxGL() {
  if (typeof window === "undefined") return Promise.resolve(null);

  if (!mapboxglModulePromise) {
    mapboxglModulePromise = import("mapbox-gl").then((mod) => {
      const mapboxgl = mod.default ?? mod;
      if (!mapboxgl.accessToken) {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
      }
      return mapboxgl;
    });
  }

  return mapboxglModulePromise;
}

/**
 * Emulates Google Maps' `gestureHandling: "cooperative"` on a Mapbox map:
 * the page scrolls normally over the map (scrollZoom stays off) unless the
 * user holds Ctrl/Cmd while scrolling, or uses a two-finger trackpad
 * pinch (which browsers report as a ctrlKey wheel event). A small "Use
 * Ctrl + scroll to zoom" hint is surfaced briefly via `onHint` so callers
 * can render whatever UI matches their existing look.
 *
 * Returns a cleanup function.
 */
export function enableCooperativeGestures(map, container, onHint) {
  if (!map || !container) return () => {};

  map.scrollZoom.disable();

  let hintTimer = null;
  const showHint = () => {
    onHint?.(true);
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => onHint?.(false), 1200);
  };

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const nextZoom = map.getZoom() - e.deltaY * 0.01;
      map.setZoom(Math.min(Math.max(nextZoom, map.getMinZoom()), map.getMaxZoom()));
    } else {
      showHint();
    }
  };

  container.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    clearTimeout(hintTimer);
    container.removeEventListener("wheel", onWheel);
  };
}

/** Converts a Google-style {north,south,east,west} box to Mapbox's
 *  [[west,south],[east,north]] LngLatBounds-constructor shape. */
export function boundsBoxToMapboxBounds(box) {
  if (!box) return null;
  return [
    [box.west, box.south],
    [box.east, box.north],
  ];
}
