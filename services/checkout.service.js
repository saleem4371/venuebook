import api from "@/lib/axios";

/* Cashfree subscription */
export const checkoutSuccess = (data) => {
  return api.get(`/checkout/checkoutSuccess/${data}`);
};