/**
 * searchFieldsConfig.js
 * ─────────────────────
 * SINGLE SOURCE OF TRUTH for the per-category search field schema.
 *
 * Previously this schema was hand-copied into three places
 * (HeroSection.jsx, search/[type]/components/ListingsSearchBar.jsx,
 * home/components/MobileSearchSheet.jsx) with hardcoded English labels.
 * Any new field had to be added in all three or they'd silently drift
 * out of sync. This file is now the only place field ids/types/order
 * are defined; all three consumers import from here.
 *
 * Labels/placeholders are i18n KEYS (not literal strings) resolved via
 * useTranslations("searchBar") / useTranslations("filter") in each
 * consumer — see messages/en.json → "searchBar" and "filter".
 *
 * Adding a field to an existing category (e.g. a new farmstay facet)
 * only requires editing the arrays below — no changes needed in the
 * three consumer components themselves. Field ORDER in each array is
 * also the render order (desktop collapse/expand bar, mobile sheet).
 *
 * `icon` + `shortLabelKey` drive the desktop bar's collapsed pill state
 * (icon + one-word label, e.g. "Where" / "Why" / "Feel" / "Dates" / "Who")
 * — only the active field expands to show its full label + control,
 * the rest collapse to these compact pills.
 */

import { MapPin, Compass, Sparkles, Calendar, Users, Briefcase, Gem, Heart, PartyPopper, Trees, Home, BedDouble } from "lucide-react";

/* ── Farmstay "Occasion" (why) — reuses the same option ids as the
   FilterDrawer's "occasion" facet (see FilterDrawer.jsx DEFAULT_FILTERS)
   so a value picked here can also be reflected as a selected filter chip
   on the results page. Labels resolved via t("occasion_" + id) in the
   shared "filter" i18n namespace.
   `icon` gives each option a small visual anchor in the Occasion/Vibe
   dropdown chips — same icon choice as FilterDrawer's own CHIP_ICONS map
   for this id, so the same occasion looks identical whether picked here
   or as a results-page filter chip. Kept as a small duplicated map rather
   than importing FilterDrawer's CHIP_ICONS (which covers ~15 other
   unrelated facets) to avoid coupling this shared config to one page's
   filter UI.
   `image` is a small thematic thumbnail per option, hotlinked from
   LoremFlickr (keyword-tagged Creative Commons photos, no API key/hosting
   needed — see SearchSelectField.jsx for the onError fallback if a photo
   fails to load). This is a third-party dependency, not a real
   product-photography pipeline: swap these for actual venuebook.in
   imagery (or self-hosted assets) if/when that exists — this is a visual
   placeholder, chosen deliberately over building a broken/no image. */
export const OCCASION_OPTIONS = [
  { id: "weekend_escape", icon: Compass, image: "https://loremflickr.com/80/80/weekend,travel" },
  { id: "family_vacation", icon: Users, image: "https://loremflickr.com/80/80/family,vacation" },
  { id: "workcation", icon: Briefcase, image: "https://loremflickr.com/80/80/laptop,beach" },
  { id: "special_occasion", icon: Gem, image: "https://loremflickr.com/80/80/celebration,event" },
  { id: "wellness_retreat", icon: Heart, image: "https://loremflickr.com/80/80/spa,wellness" },
  { id: "group_gathering", icon: PartyPopper, image: "https://loremflickr.com/80/80/friends,party" },
];

/* ── Farmstay "Vibe" (feel/atmosphere) — same pattern as Occasion above. */
export const VIBE_OPTIONS = [
  { id: "rustic_natural", icon: Trees, image: "https://loremflickr.com/80/80/rustic,nature" },
  { id: "heritage_traditional", icon: Home, image: "https://loremflickr.com/80/80/heritage,palace" },
  { id: "luxurious_modern", icon: Sparkles, image: "https://loremflickr.com/80/80/luxury,villa" },
  { id: "cozy_peaceful", icon: BedDouble, image: "https://loremflickr.com/80/80/cozy,cabin" },
];

/*
 * types:
 *   location   → LocationAutoComplete (category-aware)
 *   date       → DatePicker (single)
 *   daterange  → DatePicker (range) — occupies 2 columns visually when expanded
 *   datetime   → DatePicker (with time)
 *   guests     → GuestPicker (guestType controls which variant)
 *   select     → SearchSelectField (single-select chip list)
 */
export const SEARCH_CONFIG = {
  venues: [
    { id: "location", labelKey: "location", shortLabelKey: "short_where", icon: MapPin, type: "location", placeholderKey: "city_or_area" },
    { id: "date", labelKey: "event_date", shortLabelKey: "short_dates", icon: Calendar, type: "date" },
    { id: "guests", labelKey: "guests", shortLabelKey: "short_who", icon: Users, type: "guests", guestType: "guests" },
  ],
  /* Order here is also the desktop pill order: Where → Why → Feel → Dates → Who. */
  farmstays: [
    { id: "location", labelKey: "destination", shortLabelKey: "short_where", icon: MapPin, type: "location", placeholderKey: "where_to" },
    { id: "occasion", labelKey: "occasion", shortLabelKey: "short_why", icon: Compass, type: "select", options: OCCASION_OPTIONS, placeholderKey: "occasion_placeholder", optionKeyPrefix: "occasion_" },
    { id: "vibe", labelKey: "vibe", shortLabelKey: "short_feel", icon: Sparkles, type: "select", options: VIBE_OPTIONS, placeholderKey: "vibe_placeholder", optionKeyPrefix: "vibe_" },
    // labelKey is "short_dates" ("Dates"), not the longer "check_in_out"
    // ("Check-in & Check-out") — this is the header shown above the
    // date-RANGE value itself ("3 Sep – 13 Sep"), which already makes the
    // check-in/check-out meaning obvious. The longer phrase doesn't fit
    // an equal-width desktop column at 9px without overflowing into the
    // next field; "check_in_out" is still used verbatim for the mobile
    // sheet's section title (SHEET_CONFIG below), which has real room.
    { id: "dates", labelKey: "short_dates", shortLabelKey: "short_dates", icon: Calendar, type: "daterange", startId: "checkin", endId: "checkout", startLabelKey: "check_in", endLabelKey: "check_out", placeholderKey: "add_dates" },
    { id: "guests", labelKey: "guests", shortLabelKey: "short_who", icon: Users, type: "guests", guestType: "guests_detailed" },
  ],
  studios: [
    { id: "location", labelKey: "location", shortLabelKey: "short_where", icon: MapPin, type: "location", placeholderKey: "city_or_studio" },
    { id: "startdate", labelKey: "start", shortLabelKey: "short_dates", icon: Calendar, type: "datetime" },
    { id: "enddate", labelKey: "end", shortLabelKey: "short_dates", icon: Calendar, type: "datetime" },
    { id: "guests", labelKey: "team_size", shortLabelKey: "short_who", icon: Users, type: "guests", guestType: "attendees" },
  ],
  rentals: [
    { id: "location", labelKey: "location", shortLabelKey: "short_where", icon: MapPin, type: "location", placeholderKey: "city_or_area" },
    { id: "dates", labelKey: "dates", shortLabelKey: "short_dates", icon: Calendar, type: "daterange", startId: "startdate", endId: "enddate", startLabelKey: "start_date", endLabelKey: "end_date", placeholderKey: "add_dates" },
    { id: "guests", labelKey: "guests", shortLabelKey: "short_who", icon: Users, type: "guests", guestType: "guests" },
  ],
  workspaces: [
    { id: "location", labelKey: "location", shortLabelKey: "short_where", icon: MapPin, type: "location", placeholderKey: "city_or_area" },
    { id: "dates", labelKey: "dates", shortLabelKey: "short_dates", icon: Calendar, type: "daterange", startId: "startdate", endId: "enddate", startLabelKey: "start_date", endLabelKey: "end_date", placeholderKey: "add_dates" },
    { id: "guests", labelKey: "team_size", shortLabelKey: "short_who", icon: Users, type: "guests", guestType: "attendees" },
  ],
  experiences: [
    { id: "location", labelKey: "location", shortLabelKey: "short_where", icon: MapPin, type: "location", placeholderKey: "city_or_area" },
    { id: "date", labelKey: "date", shortLabelKey: "short_dates", icon: Calendar, type: "date" },
    { id: "guests", labelKey: "guests", shortLabelKey: "short_who", icon: Users, type: "guests", guestType: "guests" },
  ],
};

/* ── Mobile sheet per-category config (title/guestType/dateMode/…) ──
   Field labels are i18n keys resolved via t("searchBar.<key>"). */
export const SHEET_CONFIG = {
  venues: { titleKey: "find_a_venue", guestType: "guests", dateMode: "single", dateLabelKey: "event_date", locationLabelKey: "location", locationPlaceholderKey: "venue_location_placeholder" },
  farmstays: { titleKey: "find_a_farmstay", guestType: "guests_detailed", dateMode: "range", dateLabelKey: "check_in_out", locationLabelKey: "destination", locationPlaceholderKey: "where_to_question" },
  studios: { titleKey: "book_a_studio", guestType: "attendees", dateMode: "datetime", dateLabelKey: "start_time", locationLabelKey: "location", locationPlaceholderKey: "city_or_studio" },
  rentals: { titleKey: "rent_a_space", guestType: "guests_detailed", dateMode: "range", dateLabelKey: "dates", locationLabelKey: "location", locationPlaceholderKey: "city_or_space" },
  workspaces: { titleKey: "find_a_workspace", guestType: "attendees", dateMode: "range", dateLabelKey: "dates", locationLabelKey: "location", locationPlaceholderKey: "city_or_area" },
  experiences: { titleKey: "explore_title", guestType: "guests", dateMode: "single", dateLabelKey: "date", locationLabelKey: "location", locationPlaceholderKey: "city_or_area" },
};

/* ── Which categories use the desktop collapse/expand "toggle bar"
   (icon pills that expand one at a time — see ListingsSearchBar.jsx /
   HeroSection.jsx SearchField) vs. the classic always-all-fields-visible
   bar. Farmstays needed this because 5 fields (Where/Why/Feel/Dates/Who)
   don't fit a single bar readably; Venues/Studios/etc. only have 2-4
   fields and read fine the classic way — forcing the toggle there just
   wastes width on empty collapsed pills either side of one huge field.
   Add a category here if it later grows enough fields to need it. */
export const TOGGLE_BAR_CATEGORIES = ["farmstays"];

/* Farmstay-only extra sections rendered in MobileSearchSheet, in addition
   to the shared Location/Date/Guests sections every category gets. Kept
   separate from SHEET_CONFIG (which is one-config-per-category) since
   these are lists of *extra* fields, not overrides of the base three.
   Rendered between Location and Date in MobileSearchSheet.jsx so the
   mobile order matches the desktop bar: Where, Why, Feel, Dates, Who. */
export const SHEET_EXTRA_FIELDS = {
  farmstays: [
    { id: "occasion", labelKey: "occasion", options: OCCASION_OPTIONS, optionKeyPrefix: "occasion_", placeholderKey: "occasion_placeholder" },
    { id: "vibe", labelKey: "vibe", options: VIBE_OPTIONS, optionKeyPrefix: "vibe_", placeholderKey: "vibe_placeholder" },
  ],
};

/* ── Collapsed-pill value summary ─────────────────────────────────
   Short text shown under the icon+shortLabel when a field is collapsed
   (not the active/expanded one), e.g. "Goa", "12 Aug – 15 Aug", "2 guests".
   Returns "" when nothing's selected yet, so the caller can fall back to
   a lighter-weight placeholder style. `t`/`tf` are useTranslations("searchBar")
   / useTranslations("filter") from the calling component. */
export function getFieldSummary(field, { searchData = {}, dates = {}, t, tf }) {
  if (field.type === "location") {
    const v = searchData.location;
    if (!v) return "";
    if (typeof v === "string") return v;
    return v.propertyName || v.propertyQuery || v.city || v.address || "";
  }

  if (field.type === "date" || field.type === "datetime") {
    const d = dates[field.id];
    if (!d) return "";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  if (field.type === "daterange") {
    const start = dates[field.startId];
    const end = dates[field.endId];
    if (!start && !end) return "";
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (start && end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return fmt(start);
    return "";
  }

  if (field.type === "guests") {
    const v = searchData.guests;
    if (!v) return "";
    if (typeof v === "object") {
      const total = Object.values(v).reduce((s, n) => s + Number(n || 0), 0);
      return total > 0 ? `${total} ${t?.("guests")?.toLowerCase() ?? "guests"}` : "";
    }
    return String(v);
  }

  if (field.type === "select") {
    const v = searchData[field.id];
    if (!v) return "";
    return tf?.(`${field.optionKeyPrefix ?? ""}${v}`) ?? v;
  }

  return "";
}
