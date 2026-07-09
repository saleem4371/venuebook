import { load } from "@cashfreepayments/cashfree-js";

let cashfree;

export async function getCashfree() {
  if (!cashfree) {
    cashfree = await load({
      mode: 'sandbox',//process.env.NEXT_PUBLIC_CASHFREE_MODE, // sandbox or production
    });
  }

  return cashfree;
}