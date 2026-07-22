import api from "@/lib/axios";

export const recent_views = () => {
  return api.get("/home/recent_views");
};
export const vendor_category = () => {
  return api.get("/home/vendor_category");
};
// export const Api_recommeded = (region) => {
//   return api.get("/home/recommeded");
// };
export const Api_recommeded = (region) => {
  const data = JSON.parse(region);

  const parts = data.label.split(",").map(p => p.trim());

const state =
  parts.length >= 2 ? parts[parts.length - 2] : parts[0];

  return api.get("/home/recommeded", {
    params: {
      lat: data?.lat,
      lng: data?.lng,
      state: state,
    },
  });
};

export const topDestination = (region) => {
  const data = JSON.parse(region);

  const parts = data.label.split(",").map(p => p.trim());

const state =
  parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return api.get("/home/topDestination", {
    params: {
      state: state,
    },
  });
};
