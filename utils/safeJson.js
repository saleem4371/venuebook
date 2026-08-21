export function safeJsonParse(value, fallback = null) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null" ||
    value === "undefined"
  ) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch (error) {
    console.error("[safeJsonParse] Invalid JSON:", value, error);
    return fallback;
  }
}
