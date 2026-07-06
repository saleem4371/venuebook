import api from "@/lib/axios";

/* listing_create */

export const LoadProperty = async (data) => {
  return api.post("/listing", data);
};

export const save_wishlist_category  = async (data) => {
  return api.post("/listing/save_wishlist_category", data);
};

export const remove_wishlist  = async (data) => {
  return api.post("/listing/remove_wishlist", data);
};

export const UserWishlistCategory  = () => {
  return api.get("/listing/UserWishlistCategory");
};

export const UserWishlist  = () => {
  return api.get("/listing/UserWishlist");
};
// export const save_wishlist_category  = async (data) => {
//   return api.post("/save_wishlist_category", data);
// };

export const UserCompare  =  () => {
  return api.get("/listing/UserCompare");
};

export const addCompareAPI  = async (data) => {
  return api.post("/listing/addCompare", data);
};

export const removeCompareAPI  = async (data) => {
  return api.post("/listing/removeCompare", data);
};

export const userRecentViews  = async (data) => {
  return api.post("/listing/userRecentViews", data);
};
export const likedProperty  = async () => {
  return api.get("/listing/likedProperty");
};
export const addLikedProperty  = async (data) => {
  return api.post("/listing/addLikedProperty", data);
};

export const totalLikedProperty  = async (data) => {
  return api.get("/listing/totalLikedProperty", data);
};
