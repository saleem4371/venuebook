"use client";

/**
 * activityLog — a real, forward-only activity log for the "My Collections"
 * page's Recent Activity timeline.
 *
 * There is no backend audit-log endpoint (checked services/venues.service.js
 * and the Compare feature's own README-style comment in useCompareList.js —
 * neither exists). Rather than fabricate a fake-looking timeline, this logs
 * genuine events client-side (localStorage) at the exact moment each action
 * actually succeeds: like, save, move, remove, create collection. It starts
 * empty on a fresh browser/profile and only reflects activity from here on —
 * it does not (and cannot) backfill history from before this shipped.
 *
 * Call `logActivity(type, payload)` right after the real API call that
 * performs the action succeeds — see VenueCard.jsx (like) and
 * WishlistPopup.jsx (save/move/remove/create).
 */

const STORAGE_KEY = "vb_activity_log";
const MAX_ENTRIES = 30;
const EVENT_NAME = "vb-activity-log-updated";

export function logActivity(type, payload = {}) {
  if (typeof window === "undefined") return;
  try {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      ts: Date.now(),
      ...payload,
    };
    const next = [entry, ...readActivityLog()].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // localStorage unavailable — activity just won't be recorded this time.
  }
}

export function readActivityLog() {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function subscribeActivityLog(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(readActivityLog());
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

// type → human label. Kept centralized so the timeline UI and any future
// consumer render identical copy.
export function describeActivity(entry) {
  switch (entry.type) {
    case "liked":
      return `Liked ${entry.venueName || "a property"}`;
    case "saved":
      return `Saved ${entry.venueName || "a property"}${entry.collectionName ? ` to ${entry.collectionName}` : ""}`;
    case "moved":
      return `Moved ${entry.venueName || "a property"} to ${entry.collectionName || "a collection"}`;
    case "removed":
      return `Removed ${entry.venueName || "a property"}`;
    case "created_collection":
      return `Created ${entry.collectionName || "a collection"}`;
    default:
      return "Activity";
  }
}
