import api from "@/lib/axios";

/* LOGIN */
export const loadProfileApi = async () => {
  return api.get("/account/loadProfileApi");
};

export const updateProfile = async (data) => {
  return api.post("/account/updateProfile", data);
};

export const rewardsApi = async () => {
  return api.get("/account/rewardsApi");
};