// ─────────────────────────────────────────────────────────────────────────────
//  Wizard step definitions & per-step validation
// ─────────────────────────────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  {
    key: "basics",
    title: "Property Basics",
    subtitle: "Give your property a name and a short description",
  },
  {
    key: "location",
    title: "Location",
    subtitle: "Where is your property located?",
  },
  {
    key: "details",
    title: "Details",
    subtitle: "Tell guests what makes your space unique",
  },
  {
    key: "media",
    title: "Photos",
    subtitle: "Show off your space with great photos",
  },
  {
    key: "pricing",
    title: "Pricing",
    subtitle: "Set your base price",
  },
  {
    key: "review",
    title: "Review",
    subtitle: "Review your listing before submitting",
  },
];

// ─── Per-step validation ───────────────────────────────────────────────────

export const validateStep = (key, form) => {
  switch (key) {
    case "basics":
      return form.title?.trim().length > 3 && !!form.category;

    case "location":
      return (
        form.address?.trim().length > 5 &&
        form.city?.trim().length > 1 &&
        form.state?.trim().length > 1 &&
        /^[0-9]{6}$/.test(form.pincode) &&
        !!form.country
      );

    case "details": {
      const d = form.details || {};
      // At least one category-specific field must be filled
      const values = Object.values(d);
      return values.some((v) =>
        Array.isArray(v) ? v.length > 0 : String(v ?? "").trim().length > 0,
      );
    }

    case "media":
      return (form.images || []).length >= 1;

    case "pricing":
      return !!form.basePrice && Number(form.basePrice) > 0;

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
