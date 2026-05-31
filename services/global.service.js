import api from "@/lib/axios";

export const getEvents = () => {
  return api.get("/global/events"); 
};

export const LoadAllCategory = () => {
  return api.get("/global/Category");
};

export const getProperty = (category) => {
  return api.get(`/global/property?category= ${category}`);
};

export const getPropertyName = (category) => {
  return api.get(`/global/getPropertyName?category=${category}`);
};

export const findPropertyname = (category) => {
  return api.get(`/global/findPropertyname?category=${category}`);
};

export const getCountry = () => {
  return api.get(`/global/country`);
};

export const country_of_category = () => {
  return api.get(`/global/country_of_category`);
};

// export const getAllCurrencies = () => {
//   return api.get(`/global/getAllCurrencies`);
// };


export const getAmenties = (category) => {
  return api.get(`/global/getAmenties?category=${category}`);
};

