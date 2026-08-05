"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Package, ChevronDown, PackagePlus, ArrowRight } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ───────────────────────── THEME ───────────────────────── */

function tokens(isDark) {
  return {
    card: isDark ? "#111827" : "#ffffff",
    cardAlt: isDark ? "#0d1526" : "#f8fafc",
    border: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#ffffff" : "#0f172a",
    muted: isDark ? "#94a3b8" : "#64748b",
    dimmed: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)",
    trackBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
  };
}

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ───────────────────────── HOOK ───────────────────────── */

function useAddons(form, setForm) {
  const addons = form?.addons || [];

  const isEnabled = (id) =>
    addons.some((a) => (a.addon_id || a.id) === id);

  const toggle = (item) => {
    setForm((prev) => {
      const currentAddons = prev?.addons || [];

      const exists = currentAddons.some(
        (a) => (a.addon_id || a.id) === item.id
      );

      return {
        ...prev,
        addons: exists
          ? currentAddons.filter(
              (a) => (a.addon_id || a.id) !== item.id
            )
          : [
              ...currentAddons,
              {
                addon_id: item.id,
                label: item.label || item.name,
                price: "",
              },
            ],
      };
    });
  };

  return {
    addons,
    isEnabled,
    toggle,
  };
}

/* ───────────────────────── ADDON CARD ───────────────────────── */

function AddonCard({ item, on, theme, tk, onToggle }) {
  const displayPrice = item.pricingType === "unit" ? item.pricePerUnit : item.price;
  const displayUnit =
    item.pricingType === "unit"
      ? `per ${item.unitLabel || "unit"}`
      : item.unit || "per event";

  return (
    <motion.div
      layout
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: tk.card,
        border: `1px solid ${on ? `${theme.accent}55` : tk.border}`,
        boxShadow: on ? `0 0 0 2px ${theme.ring}0.10)` : "none",
      }}
    >
      {/* Image — 16:9, scales with however wide the card ends up. */}
      <div
        className="relative w-full aspect-video shrink-0"
        style={{ background: tk.trackBg }}
      >
        {item.image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${item.image}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={22} style={{ color: tk.dimmed }} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-2.5 gap-1">
        <div className="flex items-start justify-between gap-1.5">
          <h3
            className="text-[12px] font-bold leading-snug line-clamp-2"
            style={{ color: on ? theme.accent : tk.text }}
          >
            {item.label || item.name}
          </h3>

          <button
            type="button"
            onClick={onToggle}
            className="shrink-0"
            style={{
              width: 32,
              height: 18,
              borderRadius: 999,
              background: on ? theme.accent : tk.border,
              position: "relative",
            }}
          >
            <motion.div
              animate={{ x: on ? 15 : 2 }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{
                position: "absolute",
                top: 2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#fff",
              }}
            />
          </button>
        </div>

        {item.description && (
          <p
            className="text-[10px] line-clamp-1 leading-relaxed"
            style={{ color: tk.muted }}
          >
            {item.description}
          </p>
        )}

        {(item.price || item.pricePerUnit) && (
          <div
            className="flex items-baseline justify-between mt-auto pt-1.5"
            style={{ borderTop: `1px solid ${tk.border}` }}
          >
            <span className="text-[12px] font-bold" style={{ color: tk.text }}>
              {fmt(displayPrice)}
            </span>
            <span className="text-[9px]" style={{ color: tk.dimmed }}>
              {displayUnit}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function AddonsStep({
  form,
  setForm,
  category = "venues",
  addonList = [],
}) {
  const [isDark, setIsDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const check = () => {
      setIsDark(
        document.documentElement.classList.contains(
          "dark"
        )
      );
    };

    check();

    const observer = new MutationObserver(check);

    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const tk = tokens(isDark);
  const theme = getCategoryTheme(category);
  const router = useRouter();
  const params = useParams();

  const { addons, isEnabled, toggle } =
    useAddons(form, setForm);

  // Group the flat addon list by its `category` field so the grid reads
  // as sections (AV, Catering, Décor…) instead of one long undifferentiated
  // wall of cards.
  const grouped = useMemo(() => {
    const map = new Map();
    (addonList || []).forEach((item) => {
      const cat = item.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    });
    return Array.from(map.entries());
  }, [addonList]);

  // Sections start expanded — collapsedCats tracks the ones the vendor has
  // explicitly closed.
  const [collapsedCats, setCollapsedCats] = useState(() => new Set());
  const toggleCat = (cat) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            className="text-[22px] font-bold"
            style={{ color: tk.text }}
          >
            Add-ons
          </h2>

          <p
            className="text-[13px] mt-1"
            style={{ color: tk.muted }}
          >
            Select services available for this listing
          </p>
        </div>

        {addons.length > 0 && (
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-full shrink-0"
            style={{ background: `${theme.ring}0.12)`, color: theme.accent }}
          >
            {addons.length} selected
          </span>
        )}
      </div>

      {/* Empty state — nothing in Manage Add-ons yet (or everything there
          got deleted), so there's nothing to toggle on here. Send the
          vendor to go create some instead of showing a blank step. */}
      {(!addonList || addonList.length === 0) ? (
        <div
          className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl"
          style={{ border: `1px dashed ${tk.border}`, background: tk.cardAlt }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${theme.ring}0.10)` }}
          >
            <PackagePlus size={24} style={{ color: theme.accent }} />
          </div>

          <div className="text-center max-w-sm">
            <p className="text-[15px] font-semibold mb-1.5" style={{ color: tk.text }}>
              No add-ons yet
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: tk.muted }}>
              Create add-ons in Manage Add-ons — decorations, catering, equipment,
              whatever you offer — then come back here to enable them on this listing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${params?.locale}/${params?.country}/vendor/addons`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: theme.gradient }}
          >
            Go to Manage Add-ons
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
      <div className="space-y-5">
        {grouped.map(([cat, items]) => {
          const isOpen = !collapsedCats.has(cat);

          return (
            <div key={cat} className="space-y-3">
              <button
                type="button"
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between gap-2 px-5 py-3.5 rounded-xl cursor-pointer transition-colors"
                style={{ background: tk.cardAlt, border: `1px solid ${tk.border}` }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: tk.text }}
                  >
                    {cat}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${theme.ring}0.12)`, color: theme.accent }}
                  >
                    {items.length}
                  </span>
                </span>

                <ChevronDown
                  size={15}
                  style={{
                    color: tk.muted,
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s",
                  }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {items.map((item, index) => (
                        <AddonCard
                          key={`${item.id}-${index}`}
                          item={item}
                          on={isEnabled(item.id)}
                          theme={theme}
                          tk={tk}
                          onToggle={() => toggle(item)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      )}

      {/* Hint */}
      <div
        className="flex items-center gap-2 text-[11px]"
        style={{ color: tk.muted }}
      >
        <Lightbulb size={11} />
        Add-ons help increase booking value and
        customization options.
      </div>
    </div>
  );
}
