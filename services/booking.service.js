import api from "@/lib/axios";

export const InvoiceNOAPI = () => {
  return api.get(`/booking/InvoiceNOAPI`);
};

export const load_shift_event = () => {
  return api.get(`/booking/load_shift_event`);
};

export const getAvailableVenues = (data) => {
  return api.post("/booking/available-venues", data);
};

export const Load_all_packages = (data) => {
  return api.post("/booking/Load_all_packages", data);
};

export const loadAllAddons = (data) => {
  return api.post("/booking/loadAllAddons", data);
};

export const globalSetting = (data) => {
  return api.post("/booking/globalSetting", data);
};

export const booking_create = (data) => {
  return api.post("/booking/booking_create", data);
};

export const all_reservations = (data) => {
  return api.get("/booking/all_reservations", data);
};
