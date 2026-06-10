import { NextResponse } from "next/server";

const SUREPASS_BASE = "https://kyc-api.surepass.io/api/v1";

export async function POST(request) {
  try {
    const { account_number, ifsc } = await request.json();

    if (!account_number?.trim() || !ifsc?.trim()) {
      return NextResponse.json(
        { error: "Account number and IFSC are required" },
        { status: 400 }
      );
    }

    const cleanIFSC = ifsc.trim().toUpperCase();

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIFSC)) {
      return NextResponse.json({ error: "Invalid IFSC format" }, { status: 400 });
    }

    const res = await fetch(`${SUREPASS_BASE}/bank-verification/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUREPASS_API_TOKEN}`,
      },
      body: JSON.stringify({
        id_number: account_number.trim(),
        ifsc: cleanIFSC,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { error: json.message || "Bank verification failed" },
        { status: 422 }
      );
    }

    const d = json.data ?? {};

    if (!d.account_exists) {
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      full_name:      d.full_name      ?? "",
      account_number: account_number.trim(),
      bank_name:      d.bank_name      ?? "",
      branch:         d.branch         ?? "",
      city:           d.city           ?? "",
      state:          d.state          ?? "",
      ifsc:           cleanIFSC,
      rtgs:           d.rtgs           ?? false,
    });
  } catch (err) {
    console.error("[verify-bank]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
