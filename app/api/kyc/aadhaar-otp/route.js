import { NextResponse } from "next/server";

const SUREPASS_BASE = "https://kyc-api.surepass.io/api/v1";

export async function POST(request) {
  try {
    const { aadhaar_number } = await request.json();

    if (!aadhaar_number?.trim()) {
      return NextResponse.json({ error: "Aadhaar number is required" }, { status: 400 });
    }

    const aadhaar = aadhaar_number.replace(/\s/g, "");

    if (!/^\d{12}$/.test(aadhaar)) {
      return NextResponse.json({ error: "Aadhaar must be 12 digits" }, { status: 400 });
    }

    const res = await fetch(`${SUREPASS_BASE}/aadhaar-v2/generate-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUREPASS_API_TOKEN}`,
      },
      body: JSON.stringify({ id_number: aadhaar }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { error: json.message || "Failed to send OTP" },
        { status: 422 }
      );
    }

    return NextResponse.json({ client_id: json.data?.client_id });
  } catch (err) {
    console.error("[aadhaar-otp]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
