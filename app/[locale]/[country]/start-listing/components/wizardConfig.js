// ─────────────────────────────────────────────────────────────────────────────
//  Wizard step definitions, URL slug maps, and per-step validation
//  7 steps: basics → location → amenities → capacity → pricing → media → review
// ─────────────────────────────────────────────────────────────────────────────

import { getLocationConfig } from "./steps/config/locationConfig";

// ─── Step definitions ─────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  {
    key:      "basics",
    title:    "Basic Details",
    subtitle: "Name, description and property type",
  },
  {
    key:      "location",
    title:    "Location",
    subtitle: "Where guests will find your property",
  },
  {
    key:      "amenities",
    title:    "Amenities",
    subtitle: "What does your space offer guests?",
  },
  {
    key:      "capacity",
    title:    "Capacity & Space",
    subtitle: "How many guests can your property accommodate?",
  },
  {
    key:      "pricing",
    title:    "Pricing & Rates",
    subtitle: "Set your pricing and availability windows",
  },
  {
    key:      "media",
    title:    "Photos",
    subtitle: "Great photos help your listing stand out",
  },
  {
    key:      "review",
    title:    "Review & Submit",
    subtitle: "Check everything looks right before publishing",
  },
];

// ─── URL slug maps ─────────────────────────────────────────────────────────
// step key  ↔  URL-friendly slug
// Used to build /start-listing/[category]/[slug] paths.

export const STEP_TO_SLUG = {
  basics:    "basic-details",
  location:  "location",
  amenities: "amenities",
  capacity:  "capacity",
  pricing:   "pricing",
  media:     "photos",
  review:    "review",
};

export const SLUG_TO_STEP = Object.fromEntries(
  Object.entries(STEP_TO_SLUG).map(([k, v]) => [v, k]),
);

// ─── Per-step validation ───────────────────────────────────────────────────

export const validateStep = (key, form) => {
  switch (key) {

    case "basics":
      return (
        form.title?.trim().length > 3 &&
        !!form.category &&
        !!form.subcategory &&
        form.description?.trim().length >= 10
      );

    case "location": {
      const locCfg = getLocationConfig(form.country);
      return (
        form.address?.trim().length > 5 &&
        form.city?.trim().length > 1 &&
        (!locCfg.stateRequired || form.state?.trim().length > 1) &&
        locCfg.postalRegex.test(form.pincode || "") &&
        !!form.country
      );
    }

    case "amenities":
      return (form.amenities || []).length >= 1;

    case "capacity": {
      const c   = form.capacity || {};
      const cat = form.category;
      if (cat === "venue") {
        const basicOk =
          !!c.minGuests && Number(c.minGuests) > 0 &&
          !!c.maxGuests && Number(c.maxGuests) > 0 &&
          Number(c.maxGuests) >= Number(c.minGuests);
        if (!basicOk) return false;
        // Every enabled seating arrangement must have a capacity > 0
        const seating = c.seatingStyles || {};
        const seatingInvalid = Object.values(seating).some(
          (s) => s?.enabled && (!(s?.capacity) || Number(s.capacity) <= 0),
        );
        return !seatingInvalid;
      }
      if (cat === "farmstay")   return !!c.maxGuests        && Number(c.maxGuests)        > 0;
      if (cat === "studio")     return !!c.sizeSqft         && Number(c.sizeSqft)         > 0;
      if (cat === "workspace")  return !!c.seatingCapacity  && Number(c.seatingCapacity)  > 0;
      if (cat === "rental")     return !!c.maxGuests        && Number(c.maxGuests)        > 0;
      if (cat === "experience") return !!c.maxParticipants  && Number(c.maxParticipants)  > 0;
      return false;
    }

    case "pricing": {
      const p   = form.pricing || {};
      const cat = form.category;

      if (cat === "venue") {
        const mode   = p.mode || "venue";
        const shifts = p.shifts || {};

        const enabledShifts    = Object.values(shifts).filter((s) => s?.enabled);
        const anyEnabled       = enabledShifts.length > 0;
        // ALL enabled shifts must have a price > 0 (for venue and both modes)
        const allHavePrice     = anyEnabled &&
          enabledShifts.every((s) => Number(s?.price) > 0);

        if (mode === "venue") return allHavePrice;
        if (mode === "pax")   return anyEnabled;
        /* both */            return allHavePrice;
      }

      if (cat === "farmstay" || cat === "rental") {
        return !!p.nightly && Number(p.nightly) > 0;
      }

      if (cat === "studio" || cat === "workspace") {
        return (!!p.hourly && Number(p.hourly) > 0) ||
               (!!p.fullDay && Number(p.fullDay) > 0);
      }

      return !!p.nightly && Number(p.nightly) > 0;
    }

    case "media":
      return (form.images || []).length >= 1;

    case "review":
      return true;

    default:
      return false;
  }
};

// ─── Category labels ───────────────────────────────────────────────────────

export const CATEGORY_LABELS = {
  venue:      "Venues",
  farmstay:   "Farmstays",
  studio:     "Studios",
  workspace:  "Workspaces",
  rental:     "Rentals",
  experience: "Experiences",
};

export const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS).map(
  ([id, label]) => ({ id, label }),
);