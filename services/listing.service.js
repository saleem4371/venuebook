import api from "@/lib/axios";

/* listing_create */
export const parent_create = async (data) => {
  return api.post("/listing/parent_create", data);
};/* listing_create */

export const listing_create = async (data) => {
  return api.post("/listing/create", data);
};

export const last_parent_id = async (id) => {
  return api.put(`/listing/last_parent_id/${id}`);
};