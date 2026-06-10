import api from "@/lib/axios";

export const recent_views = () => {
  return api.get("/home/recent_views");
};
export const vendor_category = () => {
  return api.get("/home/vendor_category");
};
