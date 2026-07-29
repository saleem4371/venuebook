import api from "@/lib/axios";

/* listing_create */
export const total_reward_in_your_account = async () => {
  return api.get("/reward/total_reward_in_your_account");
};/* listing_create */

