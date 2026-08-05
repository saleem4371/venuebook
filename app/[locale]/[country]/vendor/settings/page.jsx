"use client";

/**
 * Vendor > General Settings.
 *
 * Reuses the same visual primitives as the customer-side Account Settings
 * module (app/[locale]/[country]/account/settings) — SettingsCard,
 * CardHeading, RowItem, EditModal, ToggleSwitch, FormField, TextInput —
 * so both settings surfaces read as one product. Icons come from
 * @tabler/icons-react (not lucide-react) for the same reason. No loading
 * skeleton by request — the panel just pops in once data arrives.
 *
 * Text fields use the same RowItem + EditModal pattern as Personal
 * Information: value + "Edit" opens a small modal to change it. Unlike
 * Personal Information's honest no-op modals (no update-profile endpoint
 * exists yet), committing here actually writes into local `settings` state
 * — the modal is just the editing surface, persistence still happens once,
 * in bulk, via the bottom Save bar (this page's fields are saved together,
 * not one at a time), so Save there still covers every field + toggle.
 *
 * LAYOUT — matches Account Settings' scroll behavior (sticky title,
 * sidebar + content each scrolling independently) without touching the
 * shared vendor/layout.jsx. That file was tried once: giving this route
 * the same non-scrolling `h-[100dvh]` shell /vendor/messages uses broke
 * rendering, because KycReminderCard's `position: sticky` is explicitly
 * designed around the page scrolling underneath it (see that component's
 * own doc comment) and had never been rendered inside a scroll-less shell
 * before. Account Settings itself can self-lock to `h-screen` because its
 * own layout clears a *fixed* Navbar with padding, not an ancestor margin
 * — the vendor shell clears its Navbar with a margin
 * (mt-[64px]/mt-[72px] in layout.jsx), so copying that trick verbatim
 * here would push a full extra viewport-height box below the fold.
 *
 * Instead: the sidebar/content row's max-height is measured from the DOM
 * (how much room is actually left below this page's own sticky title) and
 * re-measured via a ResizeObserver on document.body — not a fixed
 * dependency array — so it reacts the instant KycReminderCard's async
 * KYC-status fetch resolves and changes the page's height, instead of
 * going stale like an earlier version of this fix did. If the measurement
 * is ever off by a few pixels, the worst case is the page itself scrolls
 * that sliver — never a broken layout, because nothing here uses
 * `overflow-hidden` on anything above this component.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  IconSettings,
  IconCalendar,
  IconCreditCard,
  IconFileText,
  IconGift,
  IconShieldCheck,
  IconCircleCheck,
  IconChevronRight,
  IconArrowLeft,
} from "@tabler/icons-react";

import { useSocket } from "@/context/SocketContext";
import { useVendorCategory } from "@/context/VendorCategoryContext";
import { settingsAPI , saveSettingsAPI , loadSettingsAPI} from "@/services/settings.service";

import {
  SettingsCard,
  RowItem,
  EditModal,
  FormField,
  TextInput,
  ToggleSwitch,
  PrimaryButton,
  SecondaryButton,
} from "@/app/[locale]/[country]/account/settings/components/ui";

const BRAND = "linear-gradient(242deg,#a44bf3,#499ce8)";

// section.icon comes back from the API as a string key that doesn't
// reliably match a known icon — cycle a curated set by position instead so
// every category still looks distinct rather than repeating one fallback.
const DEFAULT_ICONS = [IconSettings, IconCalendar, IconCreditCard, IconFileText, IconGift, IconShieldCheck, IconCircleCheck];

export default function SettingsPage() {
  const { activeCategory } = useVendorCategory();

  const [loadData, setLoadData] = useState([]);
  const [settings, setSettings] = useState({});
  // Last-loaded/last-saved snapshot — diffed against `settings` to decide
  // whether the Save bar should show at all, so it isn't sitting there
  // doing nothing before anyone has touched a field.
  const [savedSnapshot, setSavedSnapshot] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [saving, setSaving] = useState(false);
  // Portal mount guard — `document` doesn't exist during SSR, so the Save
  // bar's createPortal(..., document.body) call can only run after this
  // flips true on the client. Same pattern used by every other portaled
  // overlay in this codebase (ModalBase, CategoryTransitionOverlay, etc.).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // `false` shows the flat category list with nothing else (mirrors
  // Account Settings' MobileAccountList), `true` shows just the selected
  // category with a back arrow. Only matters below `lg` — at `lg`+ the
  // sidebar and panel are always visible together and this is ignored.
  const [mobileDetail, setMobileDetail] = useState(false);
  // Text-field edit modal — mirrors PersonalInfo's openEdit/draft/save
  // trio exactly, except `commitEdit` writes the draft into real `settings`
  // state instead of showing a comingSoon toast, since these fields do
  // persist (via the bottom Save bar) once an update endpoint is called.
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState("");

  // Computed here (not further down near `current`/`isDirty` where it
  // conceptually belongs) because the measurement effect right below needs
  // it in its dependency array — `const` isn't hoisted, so referencing it
  // before this line would throw "Cannot access before initialization" on
  // every render. That's not hypothetical: an earlier version of this file
  // had `isLoading` declared near the bottom and the effect below crashed
  // the whole page as a result.
  const isLoading = !!activeCategory && loadData.length === 0;

  // How tall the sidebar/content row is allowed to get at `lg`+ before its
  // two panes (not the whole page) take over scrolling — see the LAYOUT
  // note at the top of this file for why this is a ResizeObserver on
  // document.body rather than a one-shot measurement.
  const rowRef = useRef(null);
  const [rowMaxHeight, setRowMaxHeight] = useState(null);

  useEffect(() => {
    // This row's own height is set from this effect, and the row lives
    // inside document.body — which the ResizeObserver below also watches.
    // Every write to the row's height therefore re-fires that observer,
    // and getBoundingClientRect().top returns a fractional (non-integer)
    // pixel value that drifts a hair between passes, so an unguarded
    // measure() never converges — it just keeps nudging the height by a
    // fraction of a px forever. That endless correction is what actually
    // renders as visible shaking (and why the height read as something
    // like "599.4173...", ticking, in devtools). Rounding to whole pixels
    // AND skipping the state write entirely when the rounded result hasn't
    // changed is what breaks the loop and lets it settle.
    const measure = () => {
      if (!rowRef.current || window.innerWidth < 1024) {
        setRowMaxHeight((prev) => (prev === null ? prev : null)); // below lg: normal page scroll, no clamp
        return;
      }
      const top = Math.round(rowRef.current.getBoundingClientRect().top);
      // 33, not 24: AdminLayout's PageMainWrapper adds its own md:pb-8
      // (32px) below this row that this measurement can't see (it's on an
      // ancestor, outside rowRef). The old 24px gap was 8px short of that,
      // so row-height + that trailing 32px padding summed to 8px taller
      // than the viewport — the "slight scroll" this replaces. 33 clears
      // the 32px padding with 1px to spare so rounding never tips it back
      // into overflow.
      const next = Math.max(240, Math.round(window.innerHeight) - top - 33);
      setRowMaxHeight((prev) => (prev === next ? prev : next));
    };

    measure();
    window.addEventListener("resize", measure);

    // Fires whenever document.body's rendered height actually changes —
    // for any reason, including KycReminderCard resolving its async fetch
    // well after mount. That's what makes this hold up where a fixed
    // effect-dependency list ([loadData, mobileDetail], tried previously)
    // couldn't: it has no way to know about a sibling it doesn't render.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
    // Re-run (not just rely on the ResizeObserver) once `isLoading` flips
    // to false: that's the exact moment the row this effect measures
    // actually mounts. Without this, the very first measure() call always
    // hits `!rowRef.current` (the row is still gated behind `!isLoading`
    // at mount) and falls back to `null`, leaving the clamp permanently
    // off unless the indirect body-resize signal happens to fire too —
    // which it should, but a direct trigger tied to the state that
    // controls the ref's existence is the deterministic fix.
  }, [isLoading]);

  const { status } = useSocket();

  const load = async () => {
    try {
      if (!activeCategory) return;

      // Form schema
      const res = await settingsAPI(activeCategory);
      const groups = res?.data ?? [];
      setLoadData(groups);
      setActiveSection((prev) => (groups.some((g) => g.id === prev) ? prev : groups[0]?.id ?? null));

      // Saved settings
      const resp = await loadSettingsAPI(activeCategory);

      const data = resp?.data ?? {};
      const savedSettings = data.settings ?? [];

      // Array -> Object
      const dbMap = savedSettings.reduce((acc, item) => {
        let value = item.value;

        if (value === "1") value = true;
        else if (value === "0") value = false;

        acc[item.key] = value;

        return acc;
      }, {});

      const values = {};

      groups.forEach((group) => {
        group.settings.forEach((field) => {
          if (dbMap.hasOwnProperty(field.key)) {
            values[field.key] = dbMap[field.key];
          } else {
            values[field.key] =
              field.type === "toggle"
                ? Boolean(field.value)
                : field.value ?? field.default_value ?? "";
          }
        });
      });

      setSettings(values);
      setSavedSnapshot(values);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [activeCategory]);

  useEffect(() => {
    load();
  }, [status]);

  const toggle = (key, next) => {
    setSettings((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  // Mobile list row tap: pick the category AND drill into the detail view.
  // Desktop sidebar clicks reuse the same setActiveSection directly, since
  // there's no list/detail split above `lg`.
  const selectSection = (id) => {
    setActiveSection(id);
    setMobileDetail(true);
  };

  const backToList = () => setMobileDetail(false);

  const openEdit = (field) => {
    setDraft(settings[field.key] ?? "");
    setEditingField(field);
  };

  const closeEdit = () => setEditingField(null);

  const editDirty = editingField ? draft !== (settings[editingField.key] ?? "") : false;

  const commitEdit = () => {
    if (editingField) {
      setSettings((prev) => ({ ...prev, [editingField.key]: draft }));
    }
    setEditingField(null);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        category_id: activeCategory,
        settings: Object.keys(settings).map((key) => ({
          key,
          value: settings[key],
        })),
      };

      await saveSettingsAPI(payload);

      setSavedSnapshot(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const currentIndex = Math.max(0, loadData.findIndex((s) => s.id === activeSection));
  const current = loadData[currentIndex];
  // Every value here is a flat string/boolean and mutations only ever
  // update an existing key (never add/reorder one), so a plain
  // JSON.stringify diff against the last-loaded/last-saved snapshot is a
  // safe, cheap dirty check.
  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

  return (
    <div className="space-y-6">
      {/* Sticky title — top-[64px]/[72px] reuses the exact Navbar-clearance
          constant AdminLayout's own mt-[64px]/mt-[72px] margin is built
          from, so the stick point lands right under the fixed Navbar. A
          solid background is required so content scrolling underneath
          doesn't show through once this is pinned. */}
      <div className="sticky top-[64px] md:top-[72px] z-20 bg-white dark:bg-gray-950 pb-4">
        {/* List mode (or lg+, where this flag is ignored): the normal page
            title. Detail mode below lg: just a back arrow, exactly like
            Account Settings' own list/detail header swap — the section's
            own name already shows via CardHeading inside the panel, so
            repeating it up here would be a duplicate title. */}
        {mobileDetail && (
          <button
            type="button"
            onClick={backToList}
            aria-label="Back"
            className="lg:hidden mb-4 shrink-0 w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            <IconArrowLeft size={16} stroke={1.75} className="rtl:rotate-180" />
          </button>
        )}

        <div className={mobileDetail ? "hidden lg:block" : "block"}>
          {/* Same title/subtitle type scale as Account Settings' SectionHeader,
              built locally instead of importing it — that component reserves
              48px (ml-12) to align the subtitle next to a back button, which
              this page doesn't have in list mode / on desktop. */}
          <h1 className="text-[20px] sm:text-[23px] lg:text-[24px] font-bold text-gray-900 dark:text-gray-50">
            General Settings
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
            Configure pricing, bookings, loyalty programs and business rules.
          </p>
        </div>
      </div>

      {!isLoading && (
        <div
          ref={rowRef}
          // `height`, not `maxHeight` — the sidebar/content children rely on
          // `lg:h-full` + `overflow-y-auto` to know when to scroll, and a
          // flex item only gets a *definite* height to stretch/overflow
          // against from an explicit height on its container. `max-height`
          // caps growth but doesn't hand children a definite reference, so
          // `overflow-y-auto` never had a number to compare content against.
          style={rowMaxHeight ? { height: rowMaxHeight } : undefined}
          className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:min-h-0 lg:overflow-hidden"
        >
          <VendorSettingsSidebar sections={loadData} active={current?.id} onSelect={setActiveSection} />

          {/* Mobile/tablet list mode — full-width rows, no content pane
              underneath, exactly like MobileAccountList. Hidden once a
              category is selected (mobileDetail) or at lg+, where the
              sidebar above already covers this job. */}
          {!mobileDetail && (
            <nav className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {loadData.map((section, i) => {
                const Icon = DEFAULT_ICONS[i % DEFAULT_ICONS.length];
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => selectSection(section.id)}
                    className="w-full flex items-center justify-between gap-3 py-4 text-left active:bg-gray-50 dark:active:bg-gray-800/40 transition-colors"
                  >
                    <span className="flex items-center gap-3.5 min-w-0">
                      <Icon size={20} stroke={1.75} className="shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="text-[15px] font-medium truncate text-gray-900 dark:text-gray-50">
                        {section.name}
                      </span>
                    </span>
                    <IconChevronRight size={16} className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180" />
                  </button>
                );
              })}
            </nav>
          )}

          {/* pb-20 is permanent (not conditional on isDirty) — it's just
              clearance for the portaled Save bar's own height so the last
              row is never hidden under it once the bar appears. Making it
              unconditional means isDirty toggling never changes this
              element's own height either, so nothing here shifts. */}
          <main className={`flex-1 min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 pb-20 ${mobileDetail ? "block" : "hidden lg:block"}`}>
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SettingsCard>
                    {/* No CardHeading here on purpose — the category name/
                        description already show in the sidebar (desktop)
                        and the mobile list row, so repeating it at the top
                        of the panel is a duplicate title, not a heading. */}
                    {current.settings.map((field, idx) => {
                      const last = idx === current.settings.length - 1;

                      const FieldIcon = DEFAULT_ICONS[idx % DEFAULT_ICONS.length];

                      if (field.type === "toggle") {
                        return (
                          <SpaciousToggleRow
                            key={field.key}
                            icon={<FieldIcon size={16} stroke={1.75} />}
                            label={field.label}
                            checked={!!settings[field.key]}
                            onChange={(next) => toggle(field.key, next)}
                            last={last}
                          />
                        );
                      }

                      return (
                        <RowItem
                          key={field.key}
                          icon={<FieldIcon size={16} stroke={1.75} />}
                          label={field.label}
                          value={settings[field.key]}
                          placeholder={field.placeholder}
                          editLabel="Edit"
                          onEdit={() => openEdit(field)}
                          last={last}
                        />
                      );
                    })}
                  </SettingsCard>
                </motion.div>
              )}
            </AnimatePresence>

            <EditModal open={!!editingField} onClose={closeEdit} title={editingField?.label || ""} dirty={editDirty}>
              {editingField && (
                <div className="space-y-4">
                  <FormField label={editingField.label}>
                    <TextInput
                      value={draft}
                      placeholder={editingField.placeholder}
                      onChange={(e) => setDraft(e.target.value)}
                      autoFocus
                    />
                  </FormField>
                  <div className="flex gap-2">
                    <SecondaryButton className="flex-1" onClick={closeEdit}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton className="flex-1" onClick={commitEdit}>
                      Save
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </EditModal>
          </main>
        </div>
      )}

      {/* Save bar — portaled straight to document.body instead of rendered
          in place. Two reasons, both from the same root cause (AdminLayout
          animates route transitions via a CSS transform on its
          <motion.main> ancestor, which turns that ancestor into the
          containing block for any `position: fixed` descendant of it):
            1. A `fixed` bar rendered in place would position against that
               inner box, not the real viewport — this codebase's existing
               fix for that exact problem (ModalBase, CategoryTransitionOverlay,
               the fixed bar in listing/parent_details/page.jsx) is always a
               portal to document.body, so this follows the same precedent.
            2. Being in normal document flow (even as `sticky`) meant this
               bar's mount/unmount on isDirty changing added/removed real
               height from the page, shifting everything above it and the
               scroll position — the "whole page shakes" report. A portaled
               `fixed` element never occupies layout space in the tree it's
               written in, so its appearance can't move anything else.
          `md:start-[88px]` matches AdminLayout's own md:ms-[88px] sidebar
          clearance (logical property, so this still lines up in RTL) —
          full width of the content area, not a floating card.

          z-40, not z-[9990]: VendorSidebar's own "Alerts" nav button opens
          a dropdown panel (start-full ms-2 z-50) that extends rightward
          from the rail, low enough on screen to land over this bar's
          strip. At z-[9990] this bar painted over that panel instead of
          under it. z-40 keeps it above ordinary page content (sticky title
          is z-20, KycReminderCard z-40) but below every z-50 popover in
          this shell (Alerts panel, category dropdown, mobile BottomDock). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="
                  fixed inset-x-0 md:start-[88px] bottom-0 z-40
                  bg-white/95 dark:bg-gray-900/95 backdrop-blur
                  border-t border-gray-200 dark:border-gray-800
                  px-4 sm:px-6 py-3
                  pb-[max(0.75rem,env(safe-area-inset-bottom))]
                  flex justify-end
                "
              >
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{ background: BRAND }}
                  className="px-6 py-3 rounded-xl text-white font-medium shadow-lg disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

// Same shell as RowItem (icon chip, py-6, gap-4) but with a real
// ToggleSwitch on the right instead of an Edit button — RowItem itself has
// no icon/toggle slot, so this is a small sibling built from the same
// primitives rather than a lookalike reimplementation of the switch.
function SpaciousToggleRow({ icon, label, checked, onChange, last = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-6 ${last ? "" : "border-b border-gray-100 dark:border-gray-800"}`}>
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <span className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {icon}
          </span>
        )}
        <p className="text-[16px] font-semibold text-gray-900 dark:text-gray-50 truncate">{label}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// Mirrors AccountSidebar's exact classNames (300px, rounded-2xl pill,
// layoutId-animated brand-gradient active state, tabler icons at
// size 21 / stroke 1.75) so the two settings surfaces share one nav
// language. Only rendered at `lg`+ — below that, page.jsx renders the
// MobileAccountList-style flat list / detail flow instead.
//
// The parent row (see rowMaxHeight in page.jsx) is height-clamped and
// `lg:overflow-hidden`, so this column stretches to fill it and scrolls
// on its own (`overflow-y-auto`) rather than sticking — right now (4
// categories) that scroll never actually engages.
function VendorSettingsSidebar({ sections, active, onSelect }) {
  if (!sections.length) return null;

  return (
    <nav className="hidden lg:flex lg:flex-col lg:w-[300px] shrink-0 lg:h-full lg:overflow-y-auto gap-1.5 lg:border-r lg:border-gray-100 dark:lg:border-gray-800 lg:pr-6">
      {sections.map((section, i) => {
        const Icon = DEFAULT_ICONS[i % DEFAULT_ICONS.length];
        const isActive = section.id === active;

        return (
          <button
            key={section.id}
            type="button"
            title={section.name}
            onClick={() => onSelect(section.id)}
            className={`relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15.5px] font-medium text-left transition-colors duration-150 ${
              isActive ? "text-white font-semibold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="vendor-settings-nav-active"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 rounded-2xl shadow-md shadow-violet-600/25"
                style={{ background: BRAND }}
              />
            )}
            <Icon size={21} stroke={1.75} className="relative shrink-0" />
            <span className="relative truncate">{section.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
