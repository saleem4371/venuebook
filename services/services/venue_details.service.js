import api from "@/lib/axios";

/* listing_create */

export const loadVenues = async (data) => {
  return api.get(`/venues/venue_deatils/${data}`);
};
export const loadAddons = async (data) => {
    const payload = { id : data}
  return api.post(`/venues/loadAddons`,payload);
};

export const sendEnquiryApi = async (payload) => {
  return api.post(`/venues/sendEnquiry`,payload);
};

