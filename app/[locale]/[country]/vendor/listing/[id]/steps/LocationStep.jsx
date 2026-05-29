"use client";

import { useEffect, useState } from "react";
import { Shield, Navigation2, MapPin } from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";
import ReadonlyLocationMap from "./ReadonlyLocationMap";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY SUBTITLE
───────────────────────────────────────────────────────────────────────────── */
const SUBTITLE = {
  venues:      "Your venue's registered address — visible to guests after booking confirmation.",
  farmstays:   "Your farmstay's registered address — guests use this to navigate to you.",
  studios:     "Your studio's registered location — clients and crew use this to find your space.",
  workspaces:  "Your workspace's registered address — professionals use this to locate you.",
  rentals:     "Your rental property's address — shown to confirmed guests only.",
  experiences: "The meeting point for this experience — guests arrive here to begin.",
};

/* ─────────────────────────────────────────────────────────────────────────────
   PIN GRADIENTS — per-category start/end colors for the branded map marker
───────────────────────────────────────────────────────────────────────────── */
const PIN_GRADIENTS = {
  venues:      ["#a44bf3", "#499ce8"],
  farmstays:   ["#22c55e", "#14b8a6"],
  studios:     ["#f59e0b", "#ef4444"],
  workspaces:  ["#3b82f6", "#06b6d4"],
  rentals:     ["#ec4899", "#8b5cf6"],
  experiences: ["#f97316", "#eab308"],
};

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    page:       isDark ? "#070b14"                  : "#f1f5f9",
    card:       isDark ? "#0f172a"                  : "#ffffff",
    cardInner:  isDark ? "#111827"                  : "#f8fafc",
    border:     isDark ? "rgba(255,255,255,0.07)"   : "rgba(0,0,0,0.09)",
    borderSub:  isDark ? "rgba(255,255,255,0.04)"   : "rgba(0,0,0,0.05)",
    text:       isDark ? "#f1f5f9"                  : "#0f172a",
    sub:        isDark ? "#94a3b8"                  : "#475569",
    label:      isDark ? "#475569"                  : "#9ca3af",
    shadow:     isDark
      ? "0 0 0 1px rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.60)"
      : "0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.07)",
    shadowSm:   isDark
      ? "0 2px 12px rgba(0,0,0,0.40)"
      : "0 2px 8px rgba(0,0,0,0.06)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function LocationStep({ form, category = "venues" }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const tk    = tokens(isDark);
  const theme = getCategoryTheme(category);
  const [pinStart, pinEnd] = PIN_GRADIENTS[category] ?? PIN_GRADIENTS.venues;

  const address  = form?.address  || "";
  const city     = form?.city     || "";
  const state    = form?.state    || "";
  const pincode  = form?.pincode  || "";
  const country  = form?.country  || "";
  const formLat  = form?.latitude  ? Number(form.latitude)  : undefined;
  const formLng  = form?.longitude ? Number(form.longitude) : undefined;

  const fullAddress = [address, city, state, pincode, country].filter(Boolean).join(", ");
  const hasLocation = fullAddress.trim().length > 0;

  return (
    <div className="space-y-5">

      {/* ── Heading ── */}
      <div>
        <h2 className="text-[22px] font-bold tracking-tight" style={{ color: tk.text }}>
          Location
        </h2>
        <p className="text-[13px] mt-1 leading-relaxed" style={{ color: tk.sub }}>
          {SUBTITLE[category] ?? SUBTITLE.venues}
        </p>
      </div>

      {/* ── Alert banner ── */}
      <div
        className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
        style={{
          background: `${theme.ring}0.07)`,
          border:     `1px solid ${theme.ring}0.22)`,
        }}
      >
        <Shield size={14} className="shrink-0 mt-0.5" style={{ color: theme.accent }} />
        <p className="text-[13px] leading-relaxed" style={{ color: isDark ? theme.accent : theme.accent }}>
          Location cannot be edited. To make changes, please{" "}
          <span
            className="font-semibold underline underline-offset-2 cursor-pointer"
            style={{ color: theme.accent }}
          >
            contact customer support
          </span>
          .
        </p>
      </div>

      {/* ── Main card ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: tk.card, border: `1px solid ${tk.border}`, boxShadow: tk.shadow }}
      >
        {hasLocation ? (
          <>
            {/* ── Map ── */}
            <ReadonlyLocationMap
              address={fullAddress}
              lat={formLat}
              lng={formLng}
              isDark={isDark}
              accentColor={theme.accent}
              gradient={theme.gradient}
              pinStart={pinStart}
              pinEnd={pinEnd}
              height="380px"
            />

            {/* ── Divider ── */}
            <div style={{ height: "1px", background: tk.border }} />

            {/* ── Location details grid ── */}
            <div className="p-6">

              {/* Full address — full width row */}
              <div className="mb-6 pb-6" style={{ borderBottom: `1px solid ${tk.borderSub}` }}>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: tk.label }}
                >
                  Address
                </p>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: theme.accent }} />
                  <p className="text-[15px] font-semibold leading-snug" style={{ color: tk.text }}>
                    {fullAddress}
                  </p>
                </div>
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <Cell label="Latitude"  value={formLat ? String(formLat) : "Auto-detected via address"} tk={tk} theme={theme} />
                <Cell label="Longitude" value={formLng ? String(formLng) : "Auto-detected via address"} tk={tk} theme={theme} />

                <div style={{ height: "1px", background: tk.borderSub }} className="sm:col-span-2" />

                <Cell label="City"    value={city}    tk={tk} theme={theme} />
                <Cell label="State"   value={state}   tk={tk} theme={theme} />
                <Cell label="Pincode" value={pincode} tk={tk} theme={theme} />
                <Cell label="Country" value={country} tk={tk} theme={theme} />
              </div>

            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center gap-4 py-20 px-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `${theme.ring}0.10)`,
                border:     `1px solid ${theme.ring}0.22)`,
              }}
            >
              <Navigation2 size={24} style={{ color: theme.accent }} />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-[15px] font-semibold mb-1.5" style={{ color: tk.text }}>
                No location configured
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: tk.sub }}>
                Location data hasn't been added yet. Please contact support to configure the address for this listing.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   READ-ONLY CELL
───────────────────────────────────────────────────────────────────────────── */
function Cell({ label, value, tk, theme }) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: tk.label }}
      >
        {label}
      </p>
      <p
        className="text-[14px] font-semibold leading-snug"
        style={{ color: value ? tk.text : tk.label }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
