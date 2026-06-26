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
  return api.get("/booking/Load_all_packages", data);
};

export const loadAllAddons = (data) => {
  return api.post("/booking/loadAllAddons", data);
};

export const loadAllSetting = (data) => {
  return api.post("/booking/loadAllSetting", data);
};

export const globalSetting = (data) => {
  return api.get("/booking/globalSetting", data);
};

export const booking_create = (data) => {
  return api.post("/booking/booking_create", data);
};

export const all_reservations = (data) => {
  return api.get("/booking/all_reservations", data);
};
export const reservation_invoice = (data) => {
  return api.get(`/booking/reservation_invoice/${data}`);
};

export const reservation_manage = (data) => {
  return api.get(`/booking/reservation_manage/${data}`);
};

export const Load_all_venues = (data) => {
  return api.get(`/booking/Load_all_venues`);
};

export const leads_create = (data) => {
  return api.post(`/booking/leads_create`,data);
};

export const all_other_reserve = (data) => {
  return api.post(`/booking/all_other_reserve`,data);
};
export const historical_reserve = (data) => {
  return api.post(`/booking/historical_reserve`,data);
};

export const historical_upload = (data) => {
  return api.post(`/booking/historical_upload`,data);
};


export const download_invoice = (data) => {
  return api.get(`/invoice/download/${data}`);
};

export const send_invoice = (id,data) => {
  const payload = {
    id:id,
    email:data
  }
  return api.post(`/invoice/send_invoice`,payload);
};

export const add_payment = (data) => {

  return api.post(`/booking/add_payment`,data);
};

export const all_notification = () => {

  return api.get(`/booking/all_notification`);
};

   