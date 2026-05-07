"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  DetailsStep — category-specific fields, all driven by a config map
// ─────────────────────────────────────────────────────────────────────────────

// ─── Config per category ──────────────────────────────────────────────────

const CONFIGS = {
  venue: {
    fields: [
      {
        key: "minCapacity",
        label: "Minimum capacity",
        type: "number",
        placeholder: "50",
        required: true,
      },
      {
        key: "maxCapacity",
        label: "Maximum capacity",
        type: "number",
        placeholder: "500",
        required: true,
      },
    ],
    checkboxGroups: [
      {
        key: "eventTypes",
        label: "Supported event types",
        options: [
          "Wedding", "Reception", "Corporate Event", "Birthday Party",
          "Baby Shower", "Engagement", "Farewell", "Conference",
        ],
      },
    ],
  },

  farmstay: {
    fields: [
      {
        key: "landSize",
        label: "Land size (acres)",
        type: "number",
        placeholder: "5",
        required: true,
      },
    ],
    checkboxGroups: [
      {
        key: "amenities",
        label: "Available amenities",
        options: [
          "Swimming Pool", "Bonfire Area", "Trekking Trail", "Camping Area",
          "Farm Activities", "Pet Friendly", "BBQ Grill", "Orchard",
        ],
      },
    ],
  },

  studio: {
    fields: [],
    radioGroups: [
      {
        key: "studioType",
        label: "Studio type",
        required: true,
        options: [
          "Photography Studio", "Film / Video Studio",
          "Music Studio", "Podcast Studio", "Dance / Rehearsal Studio",
        ],
      },
    ],
    checkboxGroups: [
      {
        key: "equipment",
        label: "Available equipment",
        options: [
          "DSLR / Mirrorless Camera", "Lighting Kit", "Backdrop / Greenscreen",
          "Gimbal / Stabiliser", "Drone", "Audio Mixer", "Microphones",
          "Softboxes", "Reflectors",
        ],
      },
    ],
  },

  workspace: {
    fields: [
      {
        key: "seatingCapacity",
        label: "Seating capacity",
        type: "number",
        placeholder: "20",
        required: true,
      },
    ],
    checkboxGroups: [
      {
        key: "facilities",
        label: "Facilities available",
        options: [
          "High-Speed Wi-Fi", "Air Conditioning", "Projector / Screen",
          "Whiteboard", "Video Conferencing", "Lounge Area",
          "Printer / Scanner", "Parking", "Cafeteria",
        ],
      },
    ],
  },

  rental: {
    fields: [
      {
        key: "rooms",
        label: "Number of rooms",
        type: "number",
        placeholder: "3",
        required: true,
      },
      {
        key: "maxGuests",
        label: "Maximum guests",
        type: "number",
        placeholder: "8",
        required: true,
      },
    ],
    radioGroups: [
      {
        key: "propertyType",
        label: "Property type",
        required: true,
        options: ["Villa", "Apartment", "Bungalow", "Cottage", "Penthouse", "Farmhouse"],
      },
    ],
  },

  experience: {
    fields: [
      {
        key: "activityType",
        label: "Activity / experience name",
        type: "text",
        placeholder: "e.g. Pottery Workshop, River Rafting",
        required: true,
      },
    ],
    radioGroups: [
      {
        key: "duration",
        label: "Duration",
        required: true,
        options: ["1 hour", "2 hours", "3 hours", "4 hours", "Half day", "Full day"],
      },
    ],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────

function FieldInput({ config, value, onChange, showError }) {
  const invalid = showError && config.required && !String(value ?? "").trim();
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {config.label}{" "}
        {config.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={config.type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        min={config.type === "number" ? 0 : undefined}
        className={[
          "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
          "outline-none transition text-sm",
          invalid
            ? "border-red-400 ring-1 ring-red-400"
            : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
        ].join(" ")}
      />
      {invalid && (
        <p className="text-xs text-red-500 mt-1">This field is required</p>
      )}
    </div>
  );
}

function RadioGroup({ config, value, onChange, showError }) {
  const invalid = showError && config.required && !value;
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {config.label}{" "}
        {config.required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {config.options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[
                "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                selected
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-600",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {invalid && (
        <p className="text-xs text-red-500 mt-2">Please select an option</p>
      )}
    </div>
  );
}

function CheckboxGroup({ config, value = [], onChange }) {
  const toggle = (opt) => {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(opt)
      ? current.filter((x) => x !== opt)
      : [...current, opt];
    onChange(next);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {config.label}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {config.options.map((opt) => {
          const checked = Array.isArray(value) && value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={[
                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all duration-150 text-left",
                checked
                  ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-gray-900",
              ].join(" ")}
            >
              <span
                className={[
                  "w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors",
                  checked
                    ? "bg-violet-600 border-violet-600"
                    : "border-gray-300 dark:border-gray-600",
                ].join(" ")}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function DetailsStep({ form, updateForm, attempted }) {
  const category = form.category || "venue";
  const config = CONFIGS[category] || CONFIGS.venue;
  const details = form.details || {};

  const showError = !!attempted?.details;

  const updateDetail = (key, value) => {
    updateForm({ details: { ...details, [key]: value } });
  };

  return (
    <div className="space-y-8">

      {/* Text / Number fields */}
      {(config.fields || []).length > 0 && (
        <div className={`grid gap-4 ${config.fields.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {config.fields.map((field) => (
            <FieldInput
              key={field.key}
              config={field}
              value={details[field.key]}
              onChange={(val) => updateDetail(field.key, val)}
              showError={showError}
            />
          ))}
        </div>
      )}

      {/* Radio groups */}
      {(config.radioGroups || []).map((grp) => (
        <RadioGroup
          key={grp.key}
          config={grp}
          value={details[grp.key]}
          onChange={(val) => updateDetail(grp.key, val)}
          showError={showError}
        />
      ))}

      {/* Checkbox groups */}
      {(config.checkboxGroups || []).map((grp) => (
        <CheckboxGroup
          key={grp.key}
          config={grp}
          value={details[grp.key]}
          onChange={(val) => updateDetail(grp.key, val)}
        />
      ))}

    </div>
  );
}
