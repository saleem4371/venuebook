import api from "@/lib/axios";

/* venue-listing_create */

export const LoadListing = (id) => {
  return api.get(`/venue-listing/venues/${id}`);
};

export const ListingProperty = (id) => {
   return api.get(`/venue-listing/venue/${id}`);
};

export const getGalleryCategory = (id) => {
   return api.get(`/venue-listing/getGalleryCategory/${id}`);
};

export const saveListing  = async (id,data) => {
  return api.put(`/venue-listing/saveListing/${id}`, data);
};

export const DeletePhotos  = async (data) => {
  return api.post(`/venue-listing/DeletePhotos`, data);
};

// export const saveSetting  = async (id,data) => {
//   return api.put(`/venue-listing/saveSetting/${id}`, data);
// };

//Listings
export const saveBasicStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/basic`, payload);
};

export const savePhotoStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/photos`, payload, {
  headers: {
   "Content-Type": "multipart/form-data",
  },
 });
};

export const saveCapacityStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/capacity`, payload);
};

export const saveAmenitiesStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/amenities`, payload);
};

export const saveLocationStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/location`, payload);
};

export const savePricingStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/pricing`, payload);
};

export const saveTagsStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/tags`, payload);
};

export const saveAddonsStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/addons`, payload);
};

export const saveTermsStep = async (id, payload) => {
 return api.patch(`/venue-listing/${id}/terms`, payload);
};

export const saveSetting = async (id, payload) => {
 return api.put(`/venue-listing/SaveVenueSetting/${id}`, payload);
};
// export const savePaymentStep = async (id, payload) => {
//  return api.patch(`/venue-listing/${id}/Payment`, payload);
// };
// export const saveReserveStep = async (id, payload) => {
//  return api.patch(`/venue-listing/${id}/Reserve`, payload);
// };
// export const savePaxStep = async (id, payload) => {
//  return api.patch(`/venue-listing/${id}/savePax`, payload);
// };

// export const saveDepositsStep = async (id, payload) => {
//  return api.patch(`/venue-listing/${id}/saveDeposit`, payload);
// };

// export const saveAvailabilityStep = async (id, payload) => {
//  return api.patch(`/venue-listing/${id}/saveAvailability`, payload);
// };
// export const savePricingSettingsStep = async (id, payload) => {
//  return api.patch(`/venue-listing/${id}/savePricingSetting`, payload);
// };



