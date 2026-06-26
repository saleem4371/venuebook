"use client";

/**
 * BookingDetailsSection.jsx
 *
 * Section 2: Category-specific booking details form.
 * Renders only the fields relevant to the selected category.
 * All state is lifted to CheckoutClient.
 */

import { useTranslations } from "next-intl";

/* ─── Reusable field components ─────────────────────────────────────── */

function FieldWrapper({ label, children, badge }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-neutral-300">
        {label}
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            {badge}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 text-sm placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow";

function TextInput({ placeholder, value, onChange, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
      {...rest}
    />
  );
}

function SelectInput({ options, value, onChange, placeholder }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} appearance-none cursor-pointer`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map(({ value: v, label }) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-neutral-300">{label}</span>
      <button
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200`}
        style={{ backgroundColor: checked ? "#22c55e" : "#d1d5db" }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-1 rtl:-translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ShiftPicker({ value, onChange, t }) {
  const shifts = [
    { id: "morning",   label: t("shift_morning") },
    { id: "afternoon", label: t("shift_afternoon") },
    { id: "evening",   label: t("shift_evening") },
    { id: "fullday",   label: t("shift_fullday") },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {shifts.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
            value === s.id
              ? "border-transparent text-white"
              : "border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-800 hover:border-gray-300"
          }`}
          style={value === s.id ? { backgroundColor: "#7c3aed" } : {}}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Category field renderers ──────────────────────────────────────── */

function VenueFields({ t, details, update }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("event_type")}>
          <SelectInput
            value={details.eventType}
            onChange={(v) => update("eventType", v)}
            placeholder={t("placeholder_select")}
            options={[
              { value: "wedding", label: "Wedding" },
              { value: "birthday", label: "Birthday Party" },
              { value: "corporate", label: "Corporate Event" },
              { value: "engagement", label: "Engagement" },
              { value: "babyshower", label: "Baby Shower" },
              { value: "reunion", label: "Reunion" },
              { value: "other", label: "Other" },
            ]}
          />
        </FieldWrapper>
        <FieldWrapper label={t("guest_count")}>
          <TextInput
            type="number"
            min={1}
            value={details.guestCount}
            onChange={(v) => update("guestCount", v)}
            placeholder="e.g. 150"
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("event_date")}>
          <TextInput
            type="date"
            value={details.eventDate}
            onChange={(v) => update("eventDate", v)}
          />
        </FieldWrapper>
        <FieldWrapper label={t("shift")}>
          <ShiftPicker
            value={details.shift}
            onChange={(v) => update("shift", v)}
            t={t}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label={t("special_requirements")}>
        <textarea
          value={details.specialRequirements ?? ""}
          onChange={(e) => update("specialRequirements", e.target.value)}
          placeholder={t("placeholder_notes")}
          rows={2}
          className={inputClass}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FieldWrapper label={t("decoration_notes")}>
          <TextInput value={details.decorationNotes} onChange={(v) => update("decorationNotes", v)} placeholder={t("placeholder_enter")} />
        </FieldWrapper>
        <FieldWrapper label={t("food_preferences")}>
          <SelectInput
            value={details.foodPreferences}
            onChange={(v) => update("foodPreferences", v)}
            placeholder={t("placeholder_select")}
            options={[
              { value: "veg", label: "Vegetarian" },
              { value: "nonveg", label: "Non-Vegetarian" },
              { value: "vegan", label: "Vegan" },
              { value: "jain", label: "Jain" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
        </FieldWrapper>
        <FieldWrapper label={t("vendor_notes")}>
          <TextInput value={details.vendorNotes} onChange={(v) => update("vendorNotes", v)} placeholder={t("placeholder_enter")} />
        </FieldWrapper>
      </div>
    </>
  );
}

function FarmstayFields({ t, details, update, isGoldMember }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("check_in")}>
          <TextInput type="date" value={details.checkIn} onChange={(v) => update("checkIn", v)} />
        </FieldWrapper>
        <FieldWrapper label={t("check_out")}>
          <TextInput type="date" value={details.checkOut} onChange={(v) => update("checkOut", v)} />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FieldWrapper label={t("adults")}>
          <TextInput type="number" min={1} value={details.adults} onChange={(v) => update("adults", v)} placeholder="2" />
        </FieldWrapper>
        <FieldWrapper label={t("children")}>
          <TextInput type="number" min={0} value={details.children} onChange={(v) => update("children", v)} placeholder="0" />
        </FieldWrapper>
        <FieldWrapper label={t("arrival_time")}>
          <TextInput type="time" value={details.arrivalTime} onChange={(v) => update("arrivalTime", v)} />
        </FieldWrapper>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-neutral-800 p-4 space-y-2">
        <ToggleRow label={t("pets")} checked={details.pets} onChange={(v) => update("pets", v)} />
        {details.pets && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <FieldWrapper label={t("pet_type")}>
              <SelectInput
                value={details.petType}
                onChange={(v) => update("petType", v)}
                placeholder={t("placeholder_select")}
                options={[
                  { value: "dog", label: "Dog" },
                  { value: "cat", label: "Cat" },
                ]}
              />
            </FieldWrapper>
            <FieldWrapper label={t("pet_weight")}>
              <TextInput type="number" min={1} value={details.petWeight} onChange={(v) => update("petWeight", v)} placeholder="e.g. 12" />
            </FieldWrapper>
          </div>
        )}
      </div>

      {isGoldMember && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              {t("early_checkin")}
            </p>
            <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
              {t("early_checkin_badge")}
            </span>
          </div>
          <button
            role="switch"
            aria-checked={!!details.earlyCheckIn}
            onClick={() => update("earlyCheckIn", !details.earlyCheckIn)}
            className="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors"
            style={{ backgroundColor: details.earlyCheckIn ? "#f59e0b" : "#d1d5db" }}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${details.earlyCheckIn ? "translate-x-5" : "translate-x-1"}`} />
          </button>
        </div>
      )}
    </>
  );
}

function StudioFields({ t, details, update }) {
  const lightOptions = [
    { value: "standard", label: t("lighting_standard") },
    { value: "greenscreen", label: t("lighting_greenscreen") },
    { value: "recording", label: t("lighting_recording") },
  ];
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("shoot_date")}>
          <TextInput type="date" value={details.shootDate} onChange={(v) => update("shootDate", v)} />
        </FieldWrapper>
        <FieldWrapper label={t("time_slot")}>
          <TextInput type="time" value={details.timeSlot} onChange={(v) => update("timeSlot", v)} />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("crew_size")}>
          <TextInput type="number" min={1} value={details.crewSize} onChange={(v) => update("crewSize", v)} placeholder="e.g. 5" />
        </FieldWrapper>
        <FieldWrapper label={t("lighting")}>
          <SelectInput
            value={details.lightingRequirement}
            onChange={(v) => update("lightingRequirement", v)}
            placeholder={t("placeholder_select")}
            options={lightOptions}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label={t("equipment_required")}>
        <TextInput value={details.equipmentRequired} onChange={(v) => update("equipmentRequired", v)} placeholder="Camera, Tripod, Reflector..." />
      </FieldWrapper>

      <FieldWrapper label={t("production_notes")}>
        <textarea
          value={details.productionNotes ?? ""}
          onChange={(e) => update("productionNotes", e.target.value)}
          placeholder={t("placeholder_notes")}
          rows={2}
          className={inputClass}
        />
      </FieldWrapper>
    </>
  );
}

function WorkspaceFields({ t, details, update }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("booking_date")}>
          <TextInput type="date" value={details.bookingDate} onChange={(v) => update("bookingDate", v)} />
        </FieldWrapper>
        <FieldWrapper label={t("time_slot")}>
          <SelectInput
            value={details.timeSlot}
            onChange={(v) => update("timeSlot", v)}
            placeholder={t("placeholder_select")}
            options={[
              { value: "morning", label: "9 AM – 1 PM" },
              { value: "afternoon", label: "1 PM – 5 PM" },
              { value: "evening", label: "5 PM – 9 PM" },
              { value: "fullday", label: "9 AM – 9 PM (Full Day)" },
            ]}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("seats")}>
          <TextInput type="number" min={1} value={details.seats} onChange={(v) => update("seats", v)} placeholder="e.g. 4" />
        </FieldWrapper>
        <FieldWrapper label={t("visitor_count")}>
          <TextInput type="number" min={0} value={details.visitorCount} onChange={(v) => update("visitorCount", v)} placeholder="e.g. 2" />
        </FieldWrapper>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-neutral-800 p-4 space-y-0 divide-y divide-gray-100 dark:divide-neutral-800">
        <ToggleRow label={t("meeting_room")} checked={details.meetingRoom} onChange={(v) => update("meetingRoom", v)} />
        <ToggleRow label={t("internet")} checked={details.internet} onChange={(v) => update("internet", v)} />
        <ToggleRow label={t("projector")} checked={details.projector} onChange={(v) => update("projector", v)} />
        <ToggleRow label={t("whiteboard")} checked={details.whiteboard} onChange={(v) => update("whiteboard", v)} />
        <ToggleRow label={t("tea_coffee")} checked={details.teaCoffee} onChange={(v) => update("teaCoffee", v)} />
      </div>
    </>
  );
}

function RentalFields({ t, details, update }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("rental_start")}>
          <TextInput type="datetime-local" value={details.rentalStart} onChange={(v) => update("rentalStart", v)} />
        </FieldWrapper>
        <FieldWrapper label={t("rental_end")}>
          <TextInput type="datetime-local" value={details.rentalEnd} onChange={(v) => update("rentalEnd", v)} />
        </FieldWrapper>
      </div>

      <FieldWrapper label={t("pickup")}>
        <TextInput value={details.pickup} onChange={(v) => update("pickup", v)} placeholder="Enter pickup address or area" />
      </FieldWrapper>

      <div className="rounded-xl border border-gray-100 dark:border-neutral-800 p-4 space-y-0 divide-y divide-gray-100 dark:divide-neutral-800">
        <ToggleRow label={t("delivery")} checked={details.delivery} onChange={(v) => update("delivery", v)} />
        <ToggleRow label={t("driver_required")} checked={details.driverRequired} onChange={(v) => update("driverRequired", v)} />
      </div>

      <FieldWrapper label={t("usage_notes")}>
        <textarea
          value={details.usageNotes ?? ""}
          onChange={(e) => update("usageNotes", e.target.value)}
          placeholder={t("placeholder_notes")}
          rows={2}
          className={inputClass}
        />
      </FieldWrapper>
    </>
  );
}

function ExperienceFields({ t, details, update }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("experience_date")}>
          <TextInput type="date" value={details.experienceDate} onChange={(v) => update("experienceDate", v)} />
        </FieldWrapper>
        <FieldWrapper label={t("session_time")}>
          <TextInput type="time" value={details.sessionTime} onChange={(v) => update("sessionTime", v)} />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("participants")}>
          <TextInput type="number" min={1} value={details.participants} onChange={(v) => update("participants", v)} placeholder="e.g. 4" />
        </FieldWrapper>
        <FieldWrapper label={t("difficulty")}>
          <SelectInput
            value={details.difficulty}
            onChange={(v) => update("difficulty", v)}
            placeholder={t("placeholder_select")}
            options={[
              { value: "easy", label: t("difficulty_easy") },
              { value: "moderate", label: t("difficulty_moderate") },
              { value: "hard", label: t("difficulty_hard") },
            ]}
          />
        </FieldWrapper>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-neutral-800 p-4">
        <ToggleRow label={t("equipment_rental")} checked={details.equipmentRental} onChange={(v) => update("equipmentRental", v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper label={t("dietary")}>
          <SelectInput
            value={details.dietary}
            onChange={(v) => update("dietary", v)}
            placeholder={t("placeholder_select")}
            options={[
              { value: "none", label: "No restrictions" },
              { value: "veg", label: "Vegetarian" },
              { value: "vegan", label: "Vegan" },
              { value: "glutenfree", label: "Gluten-free" },
              { value: "halal", label: "Halal" },
            ]}
          />
        </FieldWrapper>
        <FieldWrapper label={t("emergency_contact")}>
          <TextInput type="tel" value={details.emergencyContact} onChange={(v) => update("emergencyContact", v)} placeholder="+91 98765 43210" />
        </FieldWrapper>
      </div>
    </>
  );
}

/* ─── Category field map ────────────────────────────────────────────── */
const FIELD_MAP = {
  venues:      VenueFields,
  farmstays:   FarmstayFields,
  studios:     StudioFields,
  workspaces:  WorkspaceFields,
  rentals:     RentalFields,
  experiences: ExperienceFields,
};

/* ─── Main component ────────────────────────────────────────────────── */
export default function BookingDetailsSection({
  tint,
  category,
  bookingDetails,
  onUpdate,
}) {
  const t = useTranslations("checkout.booking");

  // Gold tier mock — wire to real membership data in production
  const isGoldMember = true;

  const FieldsComponent = FIELD_MAP[category] ?? VenueFields;

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
      aria-label="Booking Details"
    >
      {/* Section header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: tint.hex }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
          {t("title")}
        </h2>
      </div>

      {/* Fields */}
      <div className="px-6 py-6 space-y-5">
        <FieldsComponent
          t={t}
          details={bookingDetails}
          update={onUpdate}
          isGoldMember={isGoldMember}
        />
      </div>
    </section>
  );
}
