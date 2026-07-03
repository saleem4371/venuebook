import api from "@/lib/axios";

/* listing_create */

export const reports = async (data) => {
  return api.get("/Report/all", data);
};


