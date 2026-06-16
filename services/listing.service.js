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

export const parent_of_category = async (id) => {
  return api.put(`/listing/parent_of_category/${id}`,id);
};

export const listing_sub_check = async (id) => {
  return api.put(`/listing/listing_sub_check/${id}`,id);
};