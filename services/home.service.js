import api from "@/lib/axios";


export const recent_views  = () => {
  return api.get("/home/recent_views");
};

