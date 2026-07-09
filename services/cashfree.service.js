import api from "@/lib/axios";
import { getCashfree } from "@/lib/cashfree";

export async function startPayment(payload) {
  try {
    // Wait for API response
    const response = await api.post(
      `/cashfree/create-order`,
      payload
    );

    const data = response.data;

    console.log("Cashfree Response:", data);

    if (!data?.payment_session_id) {
      throw new Error("Payment session not received");
    }

    const cashfree = await getCashfree(
      process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox"
    );

    const result = await cashfree.checkout({
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_self", // or "_modal"
    });

    console.log(result);

    return result;
  } catch (err) {
    console.error("Payment Error:", err);
    throw err;
  }
}