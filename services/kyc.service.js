import api from "@/lib/axios";

/* ─── Existing backend endpoints ──────────────────────────────────── */

export const SubmitKYC = (data) => api.post("/kyc/submit", data);

export const kyc_status = () => api.get("/kyc/kyc_status");

export const each_kyc_status = () => api.get("/kyc/each_kyc_status");
export const suscription_detail = () => api.get("/kyc/suscription_detail");

/* ─── Surepass proxy helpers (Next.js API routes) ─────────────────── */

async function surepassPost(endpoint, body) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Verification failed");
  return data;
}
 
/**
 * Step 1 — Company PAN verification via Surepass.
 * Returns normalised PAN data: { pan_number, full_name, status, category, address }
 */
export const verifyCompanyPAN = (pan_number) =>
  surepassPost("/api/kyc/verify-pan", { pan_number });

/**
 * Step 2a — Send Aadhaar OTP.
 * Returns { client_id }
 */
export const sendAadhaarOTP = (aadhaar_number) =>
  surepassPost("/api/kyc/aadhaar-otp", { aadhaar_number });

/**
 * Step 2b — Verify Aadhaar OTP.
 * Returns { full_name, dob, gender, address, aadhaar_number }
 */
export const verifyAadhaarOTP = (client_id, otp) =>
  surepassPost("/api/kyc/aadhaar-verify", { client_id, otp });

/**
 * Step 3 — Bank account verification via Surepass.
 * Returns { full_name, account_number, bank_name, branch, city, ifsc }
 */
export const verifyBankAccount = (account_number, ifsc) =>
  surepassPost("/api/kyc/verify-bank", { account_number, ifsc });

/**
 * Step 4 — PAN document OCR + cross-check.
 * Sends multipart file; returns { match, extracted_pan, extracted_name }
 */
export const verifyPANDocument = async (file, expected_pan) => {
  const formData = new FormData();
  formData.append("file", file);
  if (expected_pan) formData.append("expected_pan", expected_pan);

  const res = await fetch("/api/kyc/verify-pan-doc", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Document verification failed");
  return data;
};
