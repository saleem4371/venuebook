import api from "@/lib/axios";

/* listing_create */

export const profile_main_page = async () => {
  return api.get("/booking/profile_main_page");
};

export const allbookingData = async () => {
  return api.get("/booking/allbookingData");
};
export const getUnreadMessageCount = async () => {
  return api.get("/booking/getUnreadMessageCount");
};

