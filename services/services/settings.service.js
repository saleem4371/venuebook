import api from "@/lib/axios";

export const settingsAPI = (id) => {
  return api.get(`/settings/get?id=${id}`);
};

export const saveSettingsAPI = (data) => {
  return api.post(`/settings/saveSettingsAPI`,data);
};

export const loadSettingsAPI = (data) => {
  return api.post(`/settings/loadSettingsAPI`,data);
};