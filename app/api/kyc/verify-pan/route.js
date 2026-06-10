import { NextResponse } from "next/server";

const SUREPASS_BASE = "https://kyc-api.surepass.io/api/v1";

function getToken() {
  return process.env.SUREPASS_API_TOKEN;
}

export async function POST(request) {
  try {
    const { pan_number } = await request.json();

    if (!pan_number?.trim()) {
      return NextResponse.json({ error: "PAN number is required" }, { status: 400 });
    }

    const pan = pan_number.trim().toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      return NextResponse.json({ error: "Invalid PAN format" }, { status: 400 });
    }

    const res = await fetch(`${SUREPASS_BASE}/pan/pan-comprehensive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ id_number: pan }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { error: json.message || "PAN verification failed" },
        { status: 422 }
      );
    }

    const d = json.data ?? {};

    // Normalise address to a display string
    const addressParts = d.address
      ? [
          d.address.street,
          d.address.locality,
          d.address.city,
          d.address.state,
          d.address.pin,
        ].filter(Boolean)
      : [];

    return NextResponse.json({
      pan_number:  d.pan_number  ?? pan,
      full_name:   d.full_name   ?? "",
      status:      d.status      ?? "VALID",
      category:    d.category    ?? d.type ?? "",
      address:     addressParts.join(", ") || null,
      last_updated: d.last_updated ?? null,
    });
  } catch (err) {
    console.error("[verify-pan]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
