import api from "@/lib/axios";

/* listing_create */
export const listing_create = async (data) => {
  return api.post("/listing/create", data);
};