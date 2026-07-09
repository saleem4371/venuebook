"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

import { save_wishlist_category } from "@/services/venues.service";
import { ICON_PRESETS, rememberCollectionIcon } from "./collectionIcons";

/**
 * CreateCollectionModal — inner panel content for creating a new collection.
 *
 * Not its own backdrop/overlay: it renders inside the shared modal shell in
 * WishlistPopup.jsx (one backdrop, one focus trap, one ESC handler — no
 * duplicated modal chrome). `save_wishlist_category` is dual-purpose on the
 * backend: passing `venue_id` alongside `name` both creates the category AND
 * saves the current venue into it in a single call, so "Create" here always
 * finishes with the venue already saved to the new collection.
 *
 * Props:
 *   venueId    string|number — the venue being saved (required for the
 *              create-and-save call)
 *   onCancel   fn()          — back to the collection list, no changes
 *   onCreated  fn(category)  — new collection created (+ venue saved to it);
 *              parent should select it and return to the list view
 */
export default function CreateCollectionModal({ venueId, onCancel, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconKey, setIconKey] = useState(ICON_PRESETS[0].key);
  const [color, setColor] = useState(ICON_PRESETS[0].color);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectIcon = (preset) => {
    setIconKey(preset.key);
    setColor(preset.color);
  };

  const validate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give your collection a name");
      return false;
    }
    if (trimmed.length < 3) {
      setError("Minimum 3 characters required");
      return false;
    }
    setError("");
    return true;
  };

  const handleCreate = async () => {
    if (!validate() || saving) return;
    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        venue_id: venueId,
        // Optimistic — harmless if the backend ignores these; persisted to
        // localStorage below regardless so the icon survives either way.
        icon: iconKey,
        color,
      };
      const res = await save_wishlist_category(payload);
      const created = res?.data || res;
      const category = {
        id: created?.id ?? created?.category_id ?? created?.data?.id,
        name: name.trim(),
        ...created,
      };
      if (category.id) rememberCollectionIcon(category.id, iconKey);
      onCreated?.(category);
    } catch (err) {
      console.error("Create collection error:", err);
      setError("Couldn't create the collection. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && document.activeElement?.tagName !== "TEXTAREA") {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back to collections"
          className="flex-shrink-0 w-8 h-8 -ml-1.5 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h2 className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
            New Collection
          </h2>
          <p className="text-[12.5px] text-gray-500 dark:text-gray-400">
            Give it a name and pick a cover icon
          </p>
        </div>
      </div>

      {/* Name */}
      <label className="block mb-3">
        <span className="sr-only">Collection name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Wedding Venues"
          maxLength={40}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
        />
      </label>

      {/* Description (optional) */}
      <label className="block mb-4">
        <span className="sr-only">Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a note (optional)"
          rows={2}
          maxLength={120}
          className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
        />
      </label>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-500">
          {error}
        </div>
      )}

      {/* Icon picker */}
      <p className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
        Cover icon
      </p>
      <div className="grid grid-cols-5 gap-2 mb-5">
        {ICON_PRESETS.map((preset) => {
          const selected = preset.key === iconKey;
          const { Icon } = preset;
          return (
            <motion.button
              key={preset.key}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => selectIcon(preset)}
              aria-label={preset.label}
              aria-pressed={selected}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="flex items-center justify-center w-11 h-11 rounded-full transition-all"
                style={{
                  backgroundColor: selected ? `${preset.color}22` : "transparent",
                  border: selected ? `2px solid ${preset.color}` : "2px solid transparent",
                  boxShadow: selected ? "none" : "0 0 0 1px rgba(0,0,0,0.06) inset",
                }}
              >
                <Icon size={18} color={preset.color} strokeWidth={2} />
              </span>
              <span className="text-[9.5px] text-gray-500 dark:text-gray-400 truncate max-w-[52px]">
                {preset.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[42px] rounded-xl text-[13.5px] font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="flex-1 min-h-[42px] rounded-xl text-[13.5px] font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Creating…" : "Create"}
        </button>
      </div>
    </div>
  );
}
