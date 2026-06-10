// ─────────────────────────────────────────────────────────────────────────────
//  Capacity config — field definitions and seating styles per category
// ─────────────────────────────────────────────────────────────────────────────

// Seating arrangement options for venues
// Ordered by frequency of use (most common first)
export const SEATING_STYLES = [
  { key: "theatre",      label: "Theatre",       desc: "Rows of chairs facing a stage or screen" },
  { key: "banquet",      label: "Banquet",        desc: "Round tables with chairs" },
  { key: "classroom",    label: "Classroom",      desc: "Tables with chairs in rows" },
  { key: "boardroom",    label: "Boardroom",      desc: "Single large central table" },
  { key: "ushape",       label: "U-Shape",        desc: "Tables arranged in a U formation" },
  { key: "cocktail",     label: "Cocktail",       desc: "High tables, no assigned seating" },
  { key: "cabaret",      label: "Cabaret",        desc: "Grouped tables facing a stage" },
  { key: "hollow_square", label: "Hollow Square", desc: "Tables forming a square with open centre" },
];

// Config per category: which fields to show
export const CAPACITY_CONFIG = {
  venue: {
    type: "venue",
    fields: [
      { key: "maxGuests", label: "Maximum guests", placeholder: "500", required: true, unit: "guests" },
      { key: "minGuests", label: "Minimum guests", placeholder: "50",  required: true, unit: "guests" },
    ],
    seatingStyles: true,
  },
  // Farmstay: custom component (FarmstayCapacity) handles rendering.
  // fields[] is intentionally empty — the component manages its own structure.
  farmstay: {
    type: "farmstay",
    fields: [],
  },
  studio: {
    type: "studio",
    fields: [
      { key: "sizeSqft",     label: "Studio size",       placeholder: "1200", required: true,  unit: "sq ft" },
      { key: "maxOccupancy", label: "Max persons inside", placeholder: "8",   required: false, unit: "persons" },
    ],
  },
  workspace: {
    type: "workspace",
    fields: [
      { key: "seatingCapacity", label: "Seating capacity", placeholder: "20",   required: true,  unit: "seats" },
      { key: "sizeSqft",        label: "Space size",       placeholder: "2000", required: false, unit: "sq ft" },
    ],
  },
  rental: {
    type: "rental",
    fields: [
      { key: "maxGuests",  label: "Maximum guests",  placeholder: "10", required: true,  unit: "guests" },
      { key: "bedrooms",   label: "Bedrooms",        placeholder: "4",  required: false, unit: "rooms" },
      { key: "bathrooms",  label: "Bathrooms",       placeholder: "3",  required: false, unit: "bathrooms" },
    ],
  },
  experience: {
    type: "experience",
    fields: [
      { key: "maxParticipants", label: "Maximum participants", placeholder: "25", required: true, unit: "persons" },
      { key: "minParticipants", label: "Minimum participants", placeholder: "5",  required: false, unit: "persons" },
    ],
  },
};
