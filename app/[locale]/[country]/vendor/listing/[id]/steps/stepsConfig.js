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

export const isStepCompleted = (step, form) => {
  switch (step) {
    case "photo":
      const totalImages =
        (form.thumbnail ? 1 : 0) +
        (form.banner ? 1 : 0) +
        (form.categories || []).reduce(
          (acc, c) => acc + (c.images?.length || 0),
          0,
        );

      return totalImages >= 5;

    case "basic":
      return (
        form.title?.length > 3 &&
        form.description?.length > 10 &&
        !!form.category
      );

    case "capacity":
      return (
        form.minCapacity > 0 &&
        form.maxCapacity > 0 &&
        Number(form.maxCapacity) >= Number(form.minCapacity)
      );

    case "location":
      return (
        form.address?.length > 5 &&
        form.city?.length > 2 &&
        form.state?.length > 2 &&
        /^[0-9]{6}$/.test(form.pincode) &&
        !!form.country
      );

    case "pricing":
      const p = form.pricing || {};

      const isShiftValid = (s) => s?.enabled && s.start && s.end && s.price > 0;

      // 🔥 At least ONE valid shift required
      return (
        isShiftValid(p.morning) ||
        isShiftValid(p.afternoon) ||
        isShiftValid(p.evening)
      );

    case "terms":
      return form.termsAccepted === true;

    // optional
    case "tags":
    case "addons":
    case "amenities":
      return true;

    default:
      return false;
  }
};
