import api from "@/lib/axios";

/* venue-listing_create */

export const LoadParent = () => {
  return api.get(`/parent-listing/parent`);
};

export const SaveParent = (id,data) => {
  return api.put(`/parent-listing/SaveParent/${id}`,data);
};