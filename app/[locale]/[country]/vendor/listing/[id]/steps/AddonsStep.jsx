"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ───────────────────────── THEME ───────────────────────── */

function tokens(isDark) {
  return {
    card: isDark ? "#111827" : "#ffffff",
    cardAlt: isDark ? "#0d1526" : "#f8fafc",
    border: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#ffffff" : "#0f172a",
    muted: isDark ? "#94a3b8" : "#64748b",
  };
}

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

  const { addons, isEnabled, toggle } =
    useAddons(form, setForm);

  console.log("addonList:", addonList);
  console.log("selected addons:", addons);

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Addon List */}
      <div className="space-y-3">
        {addonList?.map((item, index) => {
          const on = isEnabled(item.id);

          return (
            <motion.div
              key={`${item.id}-${index}`}
              layout
              className="rounded-2xl flex items-center justify-between px-4 py-3.5"
              style={{
                background: on
                  ? tk.cardAlt
                  : tk.card,
                border: `1px solid ${tk.border}`,
              }}
            >
              <span
                className="text-[13px] font-semibold"
                style={{
                  color: on
                    ? "#6366f1"
                    : tk.text,
                }}
              >
                {item.label || item.name}
              </span>

              <button
                type="button"
                onClick={() => toggle(item)}
                style={{
                  width: 42,
                  height: 22,
                  borderRadius: 999,
                  background: on
                    ? "#6366f1"
                    : tk.border,
                  position: "relative",
                }}
              >
                <motion.div
                  animate={{
                    x: on ? 20 : 2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                  }}
                  style={{
                    position: "absolute",
                    top: 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Count */}
      {addons.length > 0 && (
        <div
          className="flex items-center gap-2 text-[12px]"
          style={{ color: tk.muted }}
        >
          <Check size={12} />
          {addons.length} selected
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