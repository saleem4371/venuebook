/**
 * kycVerification.js
 * ─────────────────────────────────────────────────────────────────────
 * Verification service layer for the VenueBook KYC flow.
 *
 * CURRENT MODE: Mock — returns realistic data after a simulated delay.
 *
 * Demo values accepted:
 *   PAN:     ABCDE1234F
 *   Aadhaar: 123456781234   (any 12-digit also accepted)
 *   OTP:     123456          (any 6-digit also accepted in mock mode)
 *   Account: 123456789012   (any numeric also accepted)
 *   IFSC:    HDFC0001234    (must be valid format)
 *
 * HOW TO SWITCH TO REAL APIs:
 *   Each function has an "── API INTEGRATION POINT ──" comment block.
 *   Replace the mock return with the fetch call shown there.
 *   The return shape is identical, so UI components need zero changes.
 * ─────────────────────────────────────────────────────────────────────
 */
import api from "@/lib/axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ═══════════════════════════════════════════════════════════════════
   1. COMPANY PAN VERIFICATION
   Returns: { pan_number, company_name, status, business_category, registered_address }
═══════════════════════════════════════════════════════════════════ */
export async function verifyPAN(panNumber) {
  const pan = panNumber?.trim().toUpperCase() ?? "";

  if (!pan) throw new Error("PAN number is required.");
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    throw new Error("Invalid PAN format. Example: ABCDE1234F");
  }

  await delay(1600);

  try {
  const payload = {
    pan: pan,
  };

  const response = await api.post('/thirdParty/verifyPAN', payload);

  if (!response?.data) {
    throw new Error('PAN number already exists.');
  }

  return {
    pan_number: response.data.pan_number || pan,
    company_name: response.data.company_name || '',
    status: response.data.status || 'Active',
    business_category: response.data.business_category || 'Event Management',
    registered_address:
      response.data.registered_addressW ||
      '-',
  };
} catch (error) {
  throw new Error(
    error?.response?.data?.message ||
    error?.message ||
    'PAN verification failed'
  );
}


  // const payload = {
  //   pan:pan
  // }

  // const response =  api.post(`/thirdParty/verifyPAN`,payload);

  // if (!response.data) throw new Error("PAN number already Exits.");

  // return {
  //   pan_number:           response.data,
  //   company_name:         "ABC Events Private Limited",
  //   status:               "Active",
  //   business_category:    "Event Management",
  //   registered_address:   "MG Road, Bengaluru, Karnataka - 560001",
  // };

  /*
   * ── API INTEGRATION POINT ─────────────────────────────────────────
   * const res = await fetch("/api/kyc/verify-pan", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({ pan_number: pan }),
   * });
   * const data = await res.json();
   * if (!res.ok) throw new Error(data.error || "PAN verification failed");
   * return data;
   * ─────────────────────────────────────────────────────────────────
   */
}

/* ═══════════════════════════════════════════════════════════════════
   2a. AADHAAR — SEND OTP
   Returns: { client_id }
═══════════════════════════════════════════════════════════════════ */


export async function initializeDigilocker() {
  return  await api.get('/thirdParty/initializeDigilocker');

}
export async function sendAadhaarOTP(aadhaarNumber) {
  const clean = aadhaarNumber?.replace(/\s/g, "") ?? "";
  if (!/^\d{12}$/.test(clean)) {
    throw new Error("Aadhaar number must be exactly 12 digits.");
  }

  await delay(1000);

  const payload = {
    aadhaarNumber: aadhaarNumber,
  };

  const response = await api.post('/thirdParty/verifyAdhar', payload);

  if (!response?.data) {
    throw new Error('Aadhar number already exists.');
  }


  return { client_id: `mock_${Date.now()}` };

  /*
   * ── API INTEGRATION POINT ─────────────────────────────────────────
   * const res = await fetch("/api/kyc/aadhaar-otp", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({ aadhaar_number: clean }),
   * });
   * const data = await res.json();
   * if (!res.ok) throw new Error(data.error || "Failed to send OTP");
   * return data;
   * ─────────────────────────────────────────────────────────────────
   */
}

/* ═══════════════════════════════════════════════════════════════════
   2b. AADHAAR — VERIFY OTP
   Returns: { full_name, dob, gender, address, aadhaar_number }
═══════════════════════════════════════════════════════════════════ */
export async function verifyAadhaarOTP(clientId, otp) {
  if (!otp || otp.length !== 6) {
    throw new Error("OTP must be exactly 6 digits.");
  }

  await delay(1500);

  return {
    full_name:      "Rahul Sharma",
    dob:            "12 Aug 1991",
    gender:         "Male",
    address:        "Indiranagar, Bengaluru, Karnataka - 560038",
    aadhaar_number: "XXXX XXXX 1234",
  };

  /*
   * ── API INTEGRATION POINT ─────────────────────────────────────────
   * const res = await fetch("/api/kyc/aadhaar-verify", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({ client_id: clientId, otp }),
   * });
   * const data = await res.json();
   * if (!res.ok) throw new Error(data.error || "OTP verification failed");
   * return data;
   * ─────────────────────────────────────────────────────────────────
   */
}

/* ═══════════════════════════════════════════════════════════════════
   3. BANK ACCOUNT VERIFICATION
   Returns: { account_holder, bank_name, branch, account_masked, ifsc, status }
═══════════════════════════════════════════════════════════════════ */
export async function verifyBank(accountNumber, ifsc) {
  const acct      = accountNumber?.trim() ?? "";
  const cleanIFSC = ifsc?.trim().toUpperCase() ?? "";

  if (!acct)      throw new Error("Account number is required.");
  if (!cleanIFSC) throw new Error("IFSC code is required.");
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIFSC)) {
    throw new Error("Invalid IFSC format. Example: HDFC0001234");
  }

  await delay(1600);

  const payload = {
    acct:acct,
    cleanIFSC:cleanIFSC
  }


    const response = await api.post('/thirdParty/verifyBank', payload);

  if (!response?.data) {
    throw new Error('Account number already exists.');
  }



  return {
    account_holder:  response.data.business_name,
    bank_name:       response.data.bank_name,
    branch:          response.data.branch_name,
    account_masked:  response.data.account_number,
    ifsc:            response.data.ifsc,
    status:           response.data.verification_status,
  };

  /*
   * ── API INTEGRATION POINT ─────────────────────────────────────────
   * const res = await fetch("/api/kyc/verify-bank", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({ account_number: acct, ifsc: cleanIFSC }),
   * });
   * const data = await res.json();
   * if (!res.ok) throw new Error(data.error || "Bank verification failed");
   * return data;
   * ─────────────────────────────────────────────────────────────────
   */
}

/* ═══════════════════════════════════════════════════════════════════
   4. PAN DOCUMENT VALIDATION
   Returns: { match, message, extracted_pan }
═══════════════════════════════════════════════════════════════════ */
export async function validateDocument(file, expectedPan) {
  if (!file) throw new Error("No file provided.");

  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowed.includes(file.type)) {
    throw new Error("Only JPG, PNG, or PDF files are accepted.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be under 5 MB.");
  }
  const formData = new FormData();
   formData.append("file", file);
   if (expectedPan) formData.append("expected_pan", expectedPan);
   await api.post('/thirdParty/UploadDocument', formData);

  await delay(1400);


  return {
    match:         true,
    message:       "PAN matches verification records",
    extracted_pan: expectedPan ?? "ABCDE1234F",
  };

  /*
   * ── API INTEGRATION POINT ─────────────────────────────────────────
   * const formData = new FormData();
   * formData.append("file", file);
   * if (expectedPan) formData.append("expected_pan", expectedPan);
   * const res = await fetch("/api/kyc/verify-pan-doc", {
   *   method: "POST", body: formData,
   * });
   * const data = await res.json();
   * if (!res.ok) throw new Error(data.error || "Document validation failed");
   * return data;
   * ─────────────────────────────────────────────────────────────────
   */
}
export async function verifyGST(data) {

  const param = {
    gst_number:data
  }
   return await api.post('/thirdParty/verifyGST', param);

}
