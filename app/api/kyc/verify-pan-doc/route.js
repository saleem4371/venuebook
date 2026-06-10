import { NextResponse } from "next/server";

const SUREPASS_BASE = "https://kyc-api.surepass.io/api/v1";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file         = formData.get("file");
    const expected_pan = formData.get("expected_pan");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Forward to Surepass PAN OCR
    const surepassForm = new FormData();
    surepassForm.append("file", file);

    const res = await fetch(`${SUREPASS_BASE}/pan/pan-ocr`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUREPASS_API_TOKEN}`,
      },
      body: surepassForm,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      // OCR failed — still allow upload, flag as unverified
      return NextResponse.json({
        match: false,
        ocr_failed: true,
        extracted_pan: null,
        extracted_name: null,
        error: json.message || "Document OCR failed",
      });
    }

    const d = json.data ?? {};
    const extracted_pan = d.pan_number?.trim().toUpperCase() ?? null;

    const match =
      expected_pan && extracted_pan
        ? extracted_pan === expected_pan.trim().toUpperCase()
        : false;

    return NextResponse.json({
      match,
      ocr_failed:    false,
      extracted_pan,
      extracted_name: d.name ?? null,
      father_name:    d.father_name ?? null,
      dob:            d.dob ?? null,
    });
  } catch (err) {
    console.error("[verify-pan-doc]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
