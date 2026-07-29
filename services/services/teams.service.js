import api from "@/lib/axios";

/* ========================= Members ========================= */

export const fetchMembersAPI = (params) => {
  return api.get("/team/members", { params });
};

export const fetchMemberStatsAPI = () => {
  return api.get("/team/members/stats");
};

export const fetchMemberAPI = (id) => {
  return api.get(`/team/members/${id}`);
};

export const createMemberAPI = (data) => {
  return api.post("/team/members", data);
};

export const updateMemberAPI = (id, data) => {
  return api.patch(`/team/members/${id}`, data);
};

export const toggleMemberSuspendAPI = (id) => {
  return api.patch(`/team/members/${id}/suspend`);
};

/* ========================= Permissions ========================= */

export const fetchMemberPermissionsAPI = (id) => {
  return api.get(`/team/members/${id}/permissions`);
};

export const updateMemberPermissionsAPI = (id, permissions) => {
  return api.patch(`/team/members/${id}/permissions`, {
    permissions,
  });
};

/* ========================= Venues ========================= */

export const fetchVenuesAPI = () => {
  return api.get("/team/venues");
};

/* ========================= Role Presets ========================= */

export const fetchRolePresetsAPI = () => {
  return api.get("/team/role-presets");
};

export const fetchRolePresetPermissionsAPI = (id) => {
  return api.get(`/team/role-presets/${id}/permissions`);
};

export const createRolePresetAPI = (data) => {
  return api.post("/team/role-presets", data);
};

export const updateRolePresetInfoAPI = (id, data) => {
  return api.patch(`/team/role-presets/${id}`, data);
};

export const updateRolePresetPermissionsAPI = (id, permissions) => {
  return api.patch(`/team/role-presets/${id}/permissions`, {
    permissions,
  });
};

export const duplicateRolePresetAPI = (id) => {
  return api.post(`/team/role-presets/${id}/duplicate`);
};

export const deleteRolePresetAPI = (id) => {
  return api.delete(`/team/role-presets/${id}`);
};

/* ========================= Masking ========================= */

export const fetchMaskingRulesAPI = () => {
  return api.get("/team/masking");
};

export const updateMaskingRulesAPI = (data) => {
  return api.patch("/team/masking", data);
};
 