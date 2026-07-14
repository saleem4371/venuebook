"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Loader2 } from "lucide-react";

import { save_wishlist_category, remove_wishlist } from "@/services/venues.service";
import { useUI } from "@/context/UIContext";
import { useToast } from "@/components/ToastProvider";
import { logActivity } from "@/lib/activityLog";
import { resolveCollectionIcon } from "./collectionIcons";
import CreateCollectionModal from "./CreateCollectionModal";

/**
 * SaveToCollectionModal (exported as WishlistPopup — same import path/name
 * page.jsx already uses, so no wiring changes were needed there beyond
 * passing the new `wishlist` prop).
 *
 * Redesign of the old "Bucket List" picker: clean list rows (icon, name,
 * property count, checkmark) instead of image-thumbnail tiles, one shared
 * modal shell (backdrop + focus trap + ESC) that swaps its inner content
 * between the collection list and CreateCollectionModal, and an explicit
 * "Save" action instead of saving instantly on click — so reopening this
 * modal on an already-saved venue shows its current collection pre-checked
 * and lets the user move or remove it from here.
 *
 * A venue belongs to at most one collection at a time (matches the
 * backend's `remove_wishlist({venue_id})`, which takes no `category_id` and
 * clears every association) — so selection here is single-select/radio,
 * not multi-check.
 *
 * Props:
 *   wishvenue  array   — collections (from UserWishlistCategory)
 *   wishlist   array    — venue→collection save relations (from UserWishlist),
 *              used to derive the venue's current collection + per-row counts
 *   venue      object   — the venue being saved
 *   open       boolean
 *   user       object|null
 *   onClose    fn()     — close (with or without a change committed)
 */
export default function WishlistPopup({
  wishvenue = [],
  wishlist = [],
  venue,
  open,
  user,
  onClose,
}) {
  const { setLoginOpen } = useUI();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("list"); // "list" | "create"
  const [selectedId, setSelectedId] = useState(null);
  const [initialId, setInitialId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const panelRef = useRef(null);

  /* ── Auth gate ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (open && !user) {
      setLoginOpen(true);
      onClose?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  /* ── Seed categories + current selection whenever the modal (re)opens ── */
  useEffect(() => {
    if (!open) return;
    setCategories(wishvenue || []);
    const current = (wishlist || []).find(
      (item) => item.venue_id === venue?.childVenueId,
    );
    setSelectedId(current?.category_id ?? null);
    setInitialId(current?.category_id ?? null);
    setView("list");
    setError("");
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, venue?.childVenueId]);

  const countFor = (categoryId) =>
    (wishlist || []).filter((item) => item.category_id === categoryId).length;

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedId),
    [categories, selectedId],
  );

  const hasChange = selectedId !== initialId;

  const handleCommit = async () => {
    if (!hasChange || saving || !venue) return;
    try {
      setSaving(true);
      setError("");
      const venue_id = venue.childVenueId;

      if (initialId && selectedId && initialId !== selectedId) {
        await remove_wishlist({ venue_id });
        await save_wishlist_category({ venue_id, category_id: selectedId });
        toast.success(`Moved to "${selectedCategory?.name || "collection"}"`);
        logActivity("moved", { venueName: venue?.venueName, collectionName: selectedCategory?.name });
      } else if (!initialId && selectedId) {
        await save_wishlist_category({ venue_id, category_id: selectedId });
        toast.success(`Saved to "${selectedCategory?.name || "collection"}"`);
        logActivity("saved", { venueName: venue?.venueName, collectionName: selectedCategory?.name });
      } else if (initialId && !selectedId) {
        await remove_wishlist({ venue_id });
        toast.info("Removed from collection");
        logActivity("removed", { venueName: venue?.venueName });
      }

      onClose?.();
    } catch (err) {
      console.error("Save to collection error:", err);
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── ESC to close, Enter to submit, Tab focus-trap, body scroll lock —
        mirrors the pattern already used by LogoutConfirmationModal; no
        separate shared modal utility exists yet to reuse, so this repeats
        that same lightweight approach rather than inventing a new one. ── */
  useEffect(() => {
    if (!open) return;

    const trapFocus = (e) => {
      if (!panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(
        "button:not([disabled]), input, textarea, [tabindex]",
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "Enter" && view === "list") {
        const active = document.activeElement;
        if (active?.tagName !== "BUTTON" && active?.tagName !== "TEXTAREA") {
          e.preventDefault();
          handleCommit();
        }
      } else if (e.key === "Tab") {
        trapFocus(e);
      }
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, view, selectedId, initialId]);

  useEffect(() => {
    if (open && panelRef.current) {
      const first = panelRef.current.querySelector(
        "button, input, textarea, [tabindex]",
      );
      first?.focus();
    }
  }, [open, view]);

  const toggleRow = (cat) => {
    setSelectedId((prev) => (prev === cat.id ? null : cat.id));
  };

  const commitLabel = saving
    ? "Saving…"
    : !hasChange
      ? initialId
        ? "Saved"
        : "Save"
      : selectedId && initialId
        ? "Move"
        : selectedId
          ? "Save"
          : "Remove";

  const handleCreated = (category) => {
    setCategories((prev) => [category, ...prev]);
    setSelectedId(category.id);
    setInitialId(category.id); // already persisted server-side by the create call
    setView("list");
    toast.success(`Saved to "${category.name}"`);
    logActivity("created_collection", { collectionName: category.name });
    if (venue?.venueName) logActivity("saved", { venueName: venue.venueName, collectionName: category.name });
  };

  if (!open || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="stc-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <motion.div
          key="stc-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="stc-title"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="w-full sm:max-w-[420px] max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-gray-100 dark:border-gray-800">
            <AnimatePresence mode="wait" initial={false}>
              {view === "list" ? (
                <motion.div
                  key="list-header"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <h2 id="stc-title" className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
                    Save to Collection
                  </h2>
                  <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Choose a collection for this venue
                  </p>
                </motion.div>
              ) : (
                <span key="create-header" className="sr-only" id="stc-title">
                  New Collection
                </span>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              {view === "list" ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {error && (
                    <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-500">
                      {error}
                    </div>
                  )}

                  {categories.length === 0 && (
                    <p className="text-[13px] text-gray-400 dark:text-gray-500 text-center py-6">
                      No collections yet — create your first one below.
                    </p>
                  )}

                  <div className="flex flex-col gap-1">
                    {categories.map((cat) => {
                      const isSelected = selectedId === cat.id;
                      const { Icon, color } = resolveCollectionIcon(cat);
                      const count = countFor(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleRow(cat)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-left transition-colors ${
                            isSelected
                              ? "bg-violet-50 dark:bg-violet-500/10"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          <span
                            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                            style={{ backgroundColor: `${color}1F` }}
                          >
                            <Icon size={17} color={color} strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">
                              {cat.name}
                            </span>
                            <span className="block text-[11.5px] text-gray-500 dark:text-gray-400">
                              {cat.total_wishlist} {cat.total_wishlist === 1 ? "Property" : "Properties"}
                            </span>
                          </span>
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            <AnimatePresence>
                              {isSelected && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                                  className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center"
                                >
                                  <Check size={13} className="text-white" strokeWidth={2.5} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setView("create")}
                      className="flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-left border border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors mt-1"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800">
                        <Plus size={17} className="text-gray-500 dark:text-gray-400" />
                      </span>
                      <span className="text-[13.5px] font-semibold text-gray-700 dark:text-gray-300">
                        Create New Collection
                      </span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="create-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CreateCollectionModal
                    venueId={venue?.childVenueId}
                    onCancel={() => setView("list")}
                    onCreated={handleCreated}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {view === "list" && (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCommit}
                disabled={!hasChange || saving}
                className="w-full min-h-[46px] rounded-xl text-[14px] font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-1.5"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {commitLabel}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
