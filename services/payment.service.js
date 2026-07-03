import api from "@/lib/axios";

/* Cashfree subscription */
export const cashfree_subscription = (payload) => {
  return api.post(`/cashfree/subscription`,payload);
};

/* Verify subscription */
export const verify_subscription = (id) => {
  return api.get(`/cashfree/verify_subscription/${id}`);
};



export const cashfree_plans = (id, category) => {
  return api.get(`/cashfree/cashfree_plans/${id}`, {
    params: {
      category,
    },
  });
};

/* Stripe subscription */
export const stripe_subscription = (payload) => {
  return api.post(`/stripe/subscription`,payload);
};

export const verify_stripe_subscription = (id) => {
  return api.get(`/stripe/verify_subscription/${id}`);
};