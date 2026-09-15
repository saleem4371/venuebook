import { NextResponse } from "next/server";
import { validateEmail, validatePhone } from "@/lib/validation";
import { createSupportCallRecord } from "@/lib/supportCallRepository";

export async function POST(request) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to request a call." },
        { status: 401 }
      );
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://vb-backend-two.vercel.app";

    let authUser = null;
    try {
      const authRes = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!authRes.ok) {
        return NextResponse.json(
          { error: "Invalid or expired session. Please log in again." },
          { status: 401 }
        );
      }

      authUser = await authRes.json();
    } catch (_) {
      return NextResponse.json(
        { error: "Unable to verify authentication. Please try again." },
        { status: 401 }
      );
    }

    const userId = authUser?.id || authUser?._id || authUser?.user_id;
    if (!userId) {
      return NextResponse.json(
        { error: "Authenticated user could not be identified." },
        { status: 401 }
      );
    }

    const isVendor =
      Number(authUser?.is_vendor) === 1 ||
      authUser?.role?.toLowerCase() === "vendor";
    const requesterType = isVendor ? "VENDOR" : "CUSTOMER";

    const body = await request.json().catch(() => ({}));
    const { name, phone, email, description } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !validatePhone(phone.trim())) {
      return NextResponse.json(
        { error: "A valid phone number is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !validateEmail(email.trim())) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const record = createSupportCallRecord({
      userId,
      requesterType,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      description: description.trim(),
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      message:
        "Your call request has been submitted successfully. Our support team will contact you soon.",
      data: record,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
