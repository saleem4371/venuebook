export const steps = [
  { key: "photo", title: "Photo tour", required: true },
  { key: "basic", title: "Basic details", required: true },
  { key: "tags", title: "Tags & Categories", required: false },
  { key: "addons", title: "Addons", required: false },
  { key: "capacity", title: "Capacity", required: true },
  { key: "amenities", title: "Amenities", required: false },
  { key: "location", title: "Location", required: true },
  { key: "pricing", title: "Time & Pricing", required: true },
  { key: "terms", title: "Terms & Conditions", required: true },
];

export const isStepCompleted = (step, form = {}) => {
  switch (step) {
    case "photo": {
      const mainCount = (form?.photos || []).length;

      const sectionCount = (form?.photoSections || []).reduce(
        (acc, s) => acc + (s?.images?.length || 0),
        0,
      );

      return mainCount + sectionCount > 0;
    }

    case "basic":
      return (
        (form?.title?.length || 0) > 3 &&
        (form?.description?.length || 0) > 10 &&
        !!form?.category
      );

    case "capacity": {
      // venues / studios / experiences: min + max guests
      const hasMinMax =
        Number(form?.minCapacity) > 0 &&
        Number(form?.maxCapacity) >= Number(form?.minCapacity);

      // farmstays: rooms + beds + max guests
      const hasFarmstay =
        Number(form?.totalRooms) > 0 &&
        Number(form?.bedsPerRoom) > 0 &&
        Number(form?.maxCapacity) > 0;

      // workspaces: desks + max occupancy
      const hasWorkspace =
        Number(form?.totalDesks) > 0 &&
        Number(form?.maxCapacity) > 0;

      // rentals: bedrooms + bathrooms + max guests
      const hasRental =
        Number(form?.bedrooms) > 0 &&
        Number(form?.bathrooms) > 0 &&
        Number(form?.maxCapacity) > 0;

      return hasMinMax || hasFarmstay || hasWorkspace || hasRental;
    }

    case "location":
      return (
        form?.locationLocked === true ||
        (
          (form?.address?.length || 0) > 5 &&
          (form?.city?.length || 0) > 2 &&
          (form?.state?.length || 0) > 2 &&
          /^[0-9]{6}$/.test(form?.pincode || "") &&
          !!form?.country
        )
      );

    case "pricing": {
      const p = form?.pricing || {};

      // shift-based (venues / studios / workspaces)
      const isShiftValid = (s) =>
        s?.enabled && s?.start && s?.end && Number(s?.price) > 0;

      const hasShift =
        isShiftValid(p?.morning) ||
        isShiftValid(p?.afternoon) ||
        isShiftValid(p?.evening);

      // nightly (farmstays / rentals)
      const hasNightly = Number(p?.nightlyRate) > 0;

      // per-person (experiences)
      const hasPerPerson = Number(p?.perPersonRate) > 0;

      return hasShift || hasNightly || hasPerPerson;
    }

    case "terms":
      return (
        form?.termsAccepted === true &&
        !!form?.cancellationPolicy
      );

    // optional
    case "tags":
    case "addons":
    case "amenities":
      return true;

    default:
      return false;
  }
};