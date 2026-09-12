export async function submitCallRequest(data) {
  const res = await fetch("/api/support/call-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.error || "Failed to submit call request. Please try again.");
  }

  return json;
}
