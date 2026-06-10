import { NextResponse } from "next/server";

const SUREPASS_BASE = "https://kyc-api.surepass.io/api/v1";

export async function POST(request) {
  try {
    const { client_id, otp } = await request.json();

    if (!client_id || !otp) {
      return NextResponse.json({ error: "client_id and otp are required" }, { status: 400 });
    }

    const res = await fetch(`${SUREPASS_BASE}/aadhaar-v2/submit-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUREPASS_API_TOKEN}`,
      },
      body: JSON.stringify({ client_id, otp }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { error: json.message || "OTP verification failed" },
        { status: 422 }
      );
    }

    const d = json.data ?? {};

    // Normalise address
    const addr = d.address ?? {};
    const addressParts = [
      addr.house,
      addr.street,
      addr.locality,
      addr.vtc,
      addr.district,
      addr.state,
      addr.pincode ?? d.zip,
    ].filter(Boolean);

    // Normalise gender
    const genderMap = { M: "Male", F: "Female", T: "Transgender" };

    return NextResponse.json({
      full_name:      d.full_name ?? "",
      dob:            d.dob ?? "",
      gender:         genderMap[d.gender] ?? d.gender ?? "",
      address:        addressParts.join(", ") || null,
      aadhaar_number: d.aadhaar_number ?? "XXXX XXXX XXXX",
      mobile_verified: d.mobile_verified ?? false,
    });
  } catch (err) {
    console.error("[aadhaar-verify]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
