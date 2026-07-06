import api from "@/lib/axios";

/* venue-listing_create */

export const LoadParent = (cat) => {
  return api.get(`/parent-listing/parent/${cat}`);
};

export const SaveParent = (id,data) => {
  return api.put(`/parent-listing/SaveParent/${id}`,data);
};